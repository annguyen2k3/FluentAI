import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { SpeechClient } from '@google-cloud/speech'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

const credentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!credentialsFile) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not configured')
}

const ttsClient = new TextToSpeechClient({
  keyFilename: path.join(process.cwd(), credentialsFile)
})

const speechClient = new SpeechClient({
  keyFilename: path.join(process.cwd(), credentialsFile)
})

export const textToSpeech = async (
  text: string
): Promise<{
  success: boolean
  audio: Buffer | null
}> => {
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' }
  })

  if (!response.audioContent) {
    return {
      success: false,
      audio: null
    }
  }

  if (response.audioContent instanceof Uint8Array) {
    return {
      success: true,
      audio: Buffer.from(response.audioContent)
    }
  }

  if (typeof response.audioContent === 'string') {
    return {
      success: true,
      audio: Buffer.from(response.audioContent, 'base64')
    }
  }

  return {
    success: false,
    audio: null
  }
}

export const speechToText = async (
  audioBuffer: Buffer
): Promise<{
  success: boolean
  transcript: string
  confidence?: number
}> => {
  try {
    const audioBase64 = audioBuffer.toString('base64')

    const [response] = await speechClient.recognize({
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'en-US',
        enableAutomaticPunctuation: true
      },
      audio: {
        content: audioBase64
      }
    })

    if (!response.results || response.results.length === 0) {
      return {
        success: false,
        transcript: ''
      }
    }

    const transcription = response.results
      .map((result) => result.alternatives?.[0]?.transcript || '')
      .join(' ')
      .trim()

    const confidence = response.results[0]?.alternatives?.[0]?.confidence || 0

    return {
      success: true,
      transcript: transcription,
      confidence
    }
  } catch (error) {
    console.error('Speech-to-Text error:', error)
    return {
      success: false,
      transcript: ''
    }
  }
}
