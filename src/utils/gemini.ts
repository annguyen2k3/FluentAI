// utils/gemini.ts
import { GoogleGenAI } from '@google/genai'
import dotenv from 'dotenv'
dotenv.config()

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
const MODEL = 'gemini-2.5-flash-lite'

type GeminiChat = ReturnType<GoogleGenAI['chats']['create']>
type Session = { chat: GeminiChat; createdAt: Date; lastUsed: Date }

const sessions = new Map<string, Session>()
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const CLEANUP_MS = 5 * 60 * 1000

const defaultConfig = {
  model: MODEL,
  config: { responseMimeType: 'application/json', temperature: 0.5 }
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
  sessions.delete(key) // luôn xóa nếu tồn tại
  const chat = ai.chats.create(defaultConfig)
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
  // Override response type for the final turn so model returns pure HTML instead of JSON
  const res = await s.chat.sendMessage({
    message: completionPrompt,
    config: { responseMimeType: 'text/plain' }
  })
  console.log('Session completed:', key)
  sessions.delete(key) // xóa ngay sau khi hoàn thành
  return res.text
}

// Hàm send message 1 lần với prompt được truyền vào
export async function sendMessageOnce(prompt: string) {
  const res = await ai.chats
    .create(defaultConfig)
    .sendMessage({ message: prompt })
  return res.text
}
