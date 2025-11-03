import { ObjectId } from 'mongodb'

interface RefreshTokenType {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
  expires_at?: Date
}

export default class RefreshToken {
  _id?: ObjectId
  token: string
  created_at?: Date
  user_id: ObjectId
  expires_at?: Date

  constructor({ _id, token, created_at, user_id, expires_at }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.created_at = created_at || new Date()
    this.user_id = user_id
    this.expires_at = expires_at || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  }
}
