import { ObjectId } from 'mongodb'
import { createSlug } from '~/utils/format'

export type SentenceSpeakingType = {
  pos: number
  enSentence: string
  viSentence: string
  audioUrl: string
  phonetics: string
}

interface SSListType {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  list: SentenceSpeakingType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date
}

export default class SSList {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  list: SentenceSpeakingType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date

  constructor(ssList: SSListType) {
    this._id = ssList._id || new ObjectId()
    this.title = ssList.title || ''
    this.topic = ssList.topic
    this.level = ssList.level
    this.list = ssList.list || []
    this.pos = ssList.pos || 1
    this.slug = ssList.slug || createSlug(ssList.title)
    this.isActive = ssList.isActive !== undefined ? ssList.isActive : true
    this.create_at = ssList.create_at || new Date()
    this.update_at = ssList.update_at || new Date()
  }
}
