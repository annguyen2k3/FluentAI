import { ObjectId } from 'mongodb'
import { VocabularyHintType } from '../Other'
import { createSlug } from '~/utils/format'
import { StatusLesson } from '~/constants/enum'

export type SentenceWriteType = {
  pos: number
  content: string
  hint?: VocabularyHintType[]
}

interface WSListType {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  isActive?: boolean
  list: SentenceWriteType[]
  pos?: number
  slug?: string
  create_at?: Date
  update_at?: Date
}

export default class WSList {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  list: SentenceWriteType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date

  constructor(wsList: WSListType) {
    this._id = wsList._id || new ObjectId()
    this.title = wsList.title || ''
    this.topic = wsList.topic
    this.level = wsList.level
    this.list = wsList.list || []
    this.pos = wsList.pos || 1
    this.slug = wsList.slug || createSlug(wsList.title)
    this.isActive = wsList.isActive ?? true
    this.create_at = wsList.create_at || new Date()
    this.update_at = wsList.update_at || new Date()
  }
}
