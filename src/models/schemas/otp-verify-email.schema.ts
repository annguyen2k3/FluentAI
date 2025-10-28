import { ObjectId } from 'mongodb'
import { VerifyEmailType } from '~/constants/enum'

interface OTPVerifyEmailType {
  _id?: ObjectId
  email: string
  type: VerifyEmailType
  otp: string
  expires_at: Date
}

export default class OTPVerifyEmail {
    _id?: ObjectId
    email: string
    type: VerifyEmailType
    otp: string
    expires_at: Date

  constructor({ _id, email, type, otp, expires_at }: OTPVerifyEmailType) {
    this._id = _id || new ObjectId()
    this.email = email
    this.type = type
    this.otp = otp
    this.expires_at = expires_at || new Date(Date.now() + 1000 * 60 * 15)
  }
}
