import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'
import { ResPromptWritingParagraphTranslation } from '../responses/prompt/res-wp.schema'

export type HisWPUserSentenceType = ResPromptWritingParagraphTranslation

interface HisWPUserType {
  wpParagraphId: ObjectId
  status: StatusLesson
  sentences: HisWPUserSentenceType[]
  create_at?: Date
  update_at?: Date
}

export default class HisWPUser {
  wpParagraphId: ObjectId
  status: StatusLesson
  sentences: HisWPUserSentenceType[]
  create_at?: Date
  update_at?: Date

  constructor(hisWPUser: HisWPUserType) {
    this.wpParagraphId = hisWPUser.wpParagraphId || new ObjectId()
    this.status = hisWPUser.status || StatusLesson.IN_PROGRESS
    this.sentences = hisWPUser.sentences || []
    this.create_at = hisWPUser.create_at || new Date()
    this.update_at = hisWPUser.update_at || new Date()
  }
}
