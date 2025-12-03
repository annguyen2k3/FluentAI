import { ObjectId } from 'mongodb'
import { createSlug } from '~/utils/format'

export type TranscriptSentenceType = {
  pos: number
  startTime: number
  endTime: number
  enText: string
  viText?: string
}

export type QuestionType = {
  _id: ObjectId
  pos: number
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

interface ListeningVideoType {
  _id?: ObjectId
  title: string
  description?: string
  time?: number
  topics: ObjectId[]
  level: ObjectId
  videoUrl: string
  thumbnailUrl?: string
  transcript: TranscriptSentenceType[]
  questions: QuestionType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date
}

export default class ListeningVideo {
  _id?: ObjectId
  title: string
  description?: string
  time?: number
  topics: ObjectId[]
  level: ObjectId
  videoUrl: string
  thumbnailUrl?: string
  source?: string
  transcript: TranscriptSentenceType[]
  questions: QuestionType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date

  constructor(listeningVideo: ListeningVideoType) {
    this._id = listeningVideo._id || new ObjectId()
    this.title = listeningVideo.title || ''
    this.description = listeningVideo.description || ''
    this.time = listeningVideo.time || 0
    this.topics = listeningVideo.topics
    this.level = listeningVideo.level
    this.videoUrl = listeningVideo.videoUrl
    this.thumbnailUrl =
      listeningVideo.thumbnailUrl ||
      'https://fluent-ai-bucket.s3.ap-southeast-1.amazonaws.com/background_default_listening.png'
    this.transcript = listeningVideo.transcript || []
    this.questions = listeningVideo.questions || []
    this.pos = listeningVideo.pos || 1
    this.slug = listeningVideo.slug || createSlug(listeningVideo.title)
    this.isActive = listeningVideo.isActive ?? true
    this.create_at = listeningVideo.create_at || new Date()
    this.update_at = listeningVideo.update_at || new Date()
  }
}
