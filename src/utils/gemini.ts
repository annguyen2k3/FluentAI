// utils/gemini.ts
import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
import geminiService from '~/services/gemini.service'
dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

type GeminiChat = ReturnType<GoogleGenAI['chats']['create']>
type Session = { chat: GeminiChat; createdAt: Date; lastUsed: Date }

const sessions = new Map<string, Session>()
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const CLEANUP_MS = 5 * 60 * 1000

function getConfigFromCache() {
  const cachedConfig = geminiService.getCachedActiveConfig()
  if (!cachedConfig) {
    throw new Error(
      'Gemini config cache chưa được load. Vui lòng đợi hệ thống khởi động.'
    )
  }
  return {
    model: cachedConfig.model,
    config: {
      responseMimeType: cachedConfig.config.responseMimeType,
      temperature: cachedConfig.config.temperature,
      maxOutputTokens: cachedConfig.config.maxOutputTokens,
      topP: cachedConfig.config.topP
    }
  }
}

function keyOf(userId: string, practiceId: string) {
  return `${userId}_${practiceId}`
}

function isExpired(s: Session) {
  return Date.now() - s.lastUsed.getTime() > SESSION_TIMEOUT_MS
}

setInterval(() => {
  for (const [k, s] of sessions) if (isExpired(s)) sessions.delete(k)
}, CLEANUP_MS).unref()

export async function resetAndInitSession(
  userId: string,
  practiceId: string,
  initPrompt: string
) {
  const key = keyOf(userId, practiceId)
  sessions.delete(key)
  const config = getConfigFromCache()
  const chat = ai.chats.create(config)
  const res = await chat.sendMessage({ message: initPrompt })
  sessions.set(key, { chat, createdAt: new Date(), lastUsed: new Date() })
  return res.text
}

export async function sendInSession(
  userId: string,
  practiceId: string,
  prompt: string
) {
  const key = keyOf(userId, practiceId)
  const s = sessions.get(key)
  if (!s || isExpired(s)) {
    sessions.delete(key)
    throw new Error('Chat session not initialized or expired')
  }
  const res = await s.chat.sendMessage({ message: prompt })
  s.lastUsed = new Date()
  return res.text
}

export async function completeAndDeleteSession(
  userId: string,
  practiceId: string,
  completionPrompt: string
) {
  const key = keyOf(userId, practiceId)
  const s = sessions.get(key)
  if (!s || isExpired(s)) {
    sessions.delete(key)
    throw new Error('Chat session not initialized or expired')
  }
  // Giữ nguyên cấu hình responseMimeType từ config cache (thường là JSON)
  const res = await s.chat.sendMessage({ message: completionPrompt })
  console.log('Session completed:', key)
  sessions.delete(key) // xóa ngay sau khi hoàn thành
  return res.text
}

export async function sendMessageOnce(prompt: string) {
  const config = getConfigFromCache()
  const res = await ai.chats.create(config).sendMessage({ message: prompt })
  return res.text
}
