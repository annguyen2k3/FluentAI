import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

const credentialsFile = process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!credentialsFile) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not configured')
}

const client = new TextToSpeechClient({
  keyFilename: path.join(process.cwd(), credentialsFile)
})

const textToSpeech = async (
  text: string
): Promise<{
  success: boolean
  audio: Buffer | null
}> => {
  const [response] = await client.synthesizeSpeech({
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

export default textToSpeech
