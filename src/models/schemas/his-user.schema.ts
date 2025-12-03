import { ObjectId } from 'mongodb'
import { HistoryUserType } from '~/constants/enum'
import HisSVUser from './his-sv-user.schema'
import HisSSUser from './his-ss-user.schema'
import HisLVUser from './his-lv.schema'

type HisUserType = {
  _id?: ObjectId
  userId: ObjectId
  type: HistoryUserType
  content: HisSVUser | HisSSUser | HisLVUser
  create_at?: Date
  update_at?: Date
}

export default class HisUser {
  _id?: ObjectId
  userId: ObjectId
  type: HistoryUserType
  content: HisSVUser | HisSSUser | HisLVUser
  create_at?: Date
  update_at?: Date

  constructor(hisUser: HisUserType) {
    this._id = hisUser._id || new ObjectId()
    this.userId = hisUser.userId
    this.type = hisUser.type
    this.content = hisUser.content
    this.create_at = hisUser.create_at || new Date()
    this.update_at = hisUser.update_at || new Date()
  }
}
