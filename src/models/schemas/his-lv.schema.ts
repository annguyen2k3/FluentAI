import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'

interface HisLVUserType {
  lvVideoId: ObjectId
  status: StatusLesson
  create_at?: Date
  update_at?: Date
}

export default class HisLVUser {
  lvVideoId: ObjectId
  status: StatusLesson
  create_at?: Date
  update_at?: Date

  constructor(hisLVUser: HisLVUserType) {
    this.lvVideoId = hisLVUser.lvVideoId || new ObjectId()
    this.status = hisLVUser.status || StatusLesson.IN_PROGRESS
    this.create_at = hisLVUser.create_at || new Date()
    this.update_at = hisLVUser.update_at || new Date()
  }
}
