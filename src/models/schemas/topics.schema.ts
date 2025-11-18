import { ObjectId } from 'mongodb'
import { createSlug } from '~/utils/format'

interface TopicType {
  _id?: ObjectId
  title: string
  description: string
  fa_class_icon: string
  pos: number
  slug?: string
}

export default class Topics {
  _id?: ObjectId
  title: string
  description: string
  fa_class_icon: string
  pos: number
  slug?: string

  constructor(topics: TopicType) {
    this._id = topics._id || new ObjectId()
    this.title = topics.title || ''
    this.description = topics.description || ''
    this.fa_class_icon = topics.fa_class_icon || 'fas fa-folder'
    this.pos = topics.pos || 1
    this.slug = topics.slug || createSlug(topics.title)
  }
}
