import { ObjectId } from 'mongodb'

interface GeminiConfigType {
  _id?: ObjectId
  name: string
  description?: string
  isActive?: boolean
  model: string
  config: {
    responseMimeType: string
    temperature: number
    maxOutputTokens?: number
    topP?: number
  }
  create_at?: Date
  update_at?: Date
  test_config?: {
    success: boolean
    message: string
    test_at?: Date
  }
  updated_by?: ObjectId
}

export default class GeminiConfig {
  _id?: ObjectId
  name: string
  description?: string
  isActive?: boolean
  model: string
  config: {
    responseMimeType: string
    temperature: number
    maxOutputTokens?: number
    topP?: number
  }
  create_at?: Date
  update_at?: Date
  test_config?: {
    success: boolean
    message: string
    test_at?: Date
  }
  updated_by?: ObjectId

  constructor(geminiConfig: GeminiConfigType) {
    this._id = geminiConfig._id || new ObjectId()
    this.name = geminiConfig.name || ''
    this.model = geminiConfig.model || 'gemini-2.5-flash-lite'
    this.description = geminiConfig.description || ''
    this.isActive = geminiConfig.isActive || false
    this.config = {
      responseMimeType:
        geminiConfig.config.responseMimeType || 'application/json',
      temperature: geminiConfig.config.temperature || 0.3,
      maxOutputTokens: geminiConfig.config.maxOutputTokens || undefined,
      topP: geminiConfig.config.topP || undefined
    }
    this.create_at = geminiConfig.create_at || new Date()
    this.update_at = geminiConfig.update_at || new Date()
    this.test_config = geminiConfig.test_config || {
      success: false,
      message: '',
      test_at: undefined
    }
    this.updated_by = geminiConfig.updated_by || undefined
  }
}
