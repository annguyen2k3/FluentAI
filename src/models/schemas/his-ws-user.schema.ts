import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'
import { ResPromptWritingTranslation } from '../responses/prompt/res-ws.schema'

export type HisWSUserSentenceType = ResPromptWritingTranslation

interface HisWSUserType {
  wsListId: ObjectId
  status: StatusLesson
  sentences: HisWSUserSentenceType[]
  create_at?: Date
  update_at?: Date
}

export default class HisWSUser {
  wsListId: ObjectId
  status: StatusLesson
  sentences: HisWSUserSentenceType[]
  create_at?: Date
  update_at?: Date

  constructor(hisWSUser: HisWSUserType) {
    this.wsListId = hisWSUser.wsListId || new ObjectId()
    this.status = hisWSUser.status || StatusLesson.IN_PROGRESS
    this.sentences = hisWSUser.sentences || []
    this.create_at = hisWSUser.create_at || new Date()
    this.update_at = hisWSUser.update_at || new Date()
  }
}
