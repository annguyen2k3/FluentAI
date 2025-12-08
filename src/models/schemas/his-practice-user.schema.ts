import { ObjectId } from 'mongodb'
import { HistoryUserType } from '~/constants/enum'
import HisSVUser from './his-sv-user.schema'
import HisSSUser from './his-ss-user.schema'
import HisLVUser from './his-lv.schema'
import HisWSUser from './his-ws-user.schema'
import HisWPUser from './his-wp-user.schema'

type HisPracticeUserType = {
  _id?: ObjectId
  userId: ObjectId
  type: HistoryUserType
  content: HisSVUser | HisSSUser | HisLVUser | HisWSUser | HisWPUser
  create_at?: Date
  update_at?: Date
}

export default class HisPracticeUser {
  _id?: ObjectId
  userId: ObjectId
  type: HistoryUserType
  content: HisSVUser | HisSSUser | HisLVUser | HisWSUser | HisWPUser
  create_at?: Date
  update_at?: Date

  constructor(hisPracticeUser: HisPracticeUserType) {
    this._id = hisPracticeUser._id || new ObjectId()
    this.userId = hisPracticeUser.userId
    this.type = hisPracticeUser.type
    this.content = hisPracticeUser.content
    this.create_at = hisPracticeUser.create_at || new Date()
    this.update_at = hisPracticeUser.update_at || new Date()
  }
}
