import { ObjectId } from 'mongodb'
import { AdminRole } from '~/constants/enum'

interface AdminType {
  _id?: ObjectId
  username: string
  email: string
  password: string
  role: AdminRole
  avatar?: string
  create_at?: Date
  update_at?: Date
}

export default class Admin {
  _id?: ObjectId
  username: string
  email: string
  password: string
  role: AdminRole
  avatar?: string
  create_at?: Date
  update_at?: Date

  constructor(admin: AdminType) {
    this._id = admin._id || new ObjectId()
    this.username = admin.username || 'admin_' + this._id.toString()
    this.email = admin.email
    this.password = admin.password
    this.role = admin.role
    this.avatar = admin.avatar || 'https://fluent-ai-bucket.s3.ap-southeast-1.amazonaws.com/avatar.png'
    this.create_at = admin.create_at || new Date()
    this.update_at = admin.update_at || new Date()
  }
}
