import { ObjectId } from 'mongodb'

interface ShareDocumentType {
  _id?: ObjectId
  title: string
  author: string
  content: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date
}

export default class ShareDocument {
  _id?: ObjectId
  title: string
  author: string
  content: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date

  constructor(shareDocument: ShareDocumentType) {
    this._id = shareDocument._id || new ObjectId()
    this.title = shareDocument.title
    this.author = shareDocument.author || 'Quản trị viên'
    this.content = shareDocument.content
    this.isActive = shareDocument.isActive ?? true
    this.create_at = shareDocument.create_at || new Date()
    this.update_at = shareDocument.update_at || new Date()
  }
}
