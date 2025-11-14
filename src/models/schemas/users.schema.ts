import { ObjectId } from 'mongodb'
import { GenderType, UserStatus } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  username?: string
  email: string
  password: string
  status?: UserStatus
  create_at?: Date
  update_at?: Date
  avatar?: string
  date_of_birth?: Date
  phone_number?: string
  gender?: GenderType
}

export default class User {
  _id?: ObjectId
  username?: string
  email: string
  password: string
  status?: UserStatus
  create_at?: Date
  update_at?: Date
  avatar?: string
  date_of_birth?: Date
  phone_number?: string
  gender?: GenderType

  constructor(user: UserType) {
    const id = user._id || new ObjectId()
    const date = new Date()
    this._id = id
    this.username = user.username || 'user_' + id.toString()
    this.email = user.email
    this.password = user.password
    this.status = user.status || UserStatus.ACTIVE
    this.create_at = user.create_at || date
    this.update_at = user.update_at || date
    this.avatar = user.avatar || 'https://fluent-ai-bucket.s3.ap-southeast-1.amazonaws.com/avatar_user_default.png'
    this.date_of_birth = user.date_of_birth || undefined
    this.phone_number = user.phone_number || ''
    this.gender = user.gender || undefined
  }
}
