import { ObjectId } from 'mongodb'
import { VocabularyHintType } from '../Other'
import { createSlug } from '~/utils/format'

interface WPParagraphType {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  type: ObjectId
  content: string
  hint?: VocabularyHintType[]
  slug?: string
  create_at?: Date
  update_at?: Date
}

export default class WPParagraph {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  type: ObjectId
  content: string
  hint?: VocabularyHintType[]
  slug?: string
  create_at?: Date
  update_at?: Date

  constructor(wpParagraph: WPParagraphType) {
    this._id = wpParagraph._id || new ObjectId()
    this.title = wpParagraph.title || ''
    this.topic = wpParagraph.topic || new ObjectId()
    this.level = wpParagraph.level || new ObjectId()
    this.type = wpParagraph.type || new ObjectId()
    this.content = wpParagraph.content || ''
    this.hint = wpParagraph.hint || []
    this.slug = wpParagraph.slug || createSlug(wpParagraph.title)
    this.create_at = wpParagraph.create_at || new Date()
    this.update_at = wpParagraph.update_at || new Date()
  }
}
