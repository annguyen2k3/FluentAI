import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'
import { SentenceSpeakingType } from './ss-list.schema'

export type LetterSpeakingSuggestionType = {
  word: string
  feedback_issue: string
  feedback_tip: string
}

export type HisSSUserSentenceType = SentenceSpeakingType & {
  passed: boolean
  enSentence: string
  user_transcript: string
  user_phonetics: string
  user_suggestions: LetterSpeakingSuggestionType[]
  general_feedback: string
}

interface HisSSUserType {
  _id?: ObjectId
  userId: ObjectId
  ssListId: ObjectId
  status: StatusLesson
  sentences: HisSSUserSentenceType[]
  create_at?: Date
  update_at?: Date
}

export default class HisSSUser {
  _id?: ObjectId
  userId: ObjectId
  ssListId: ObjectId
  status: StatusLesson
  sentences: HisSSUserSentenceType[]
  create_at?: Date
  update_at?: Date

  constructor(hisSSUser: HisSSUserType) {
    this._id = hisSSUser._id || new ObjectId()
    this.userId = hisSSUser.userId
    this.ssListId = hisSSUser.ssListId
    this.status = hisSSUser.status || StatusLesson.IN_PROGRESS
    this.sentences = hisSSUser.sentences || []
    this.create_at = hisSSUser.create_at || new Date()
    this.update_at = hisSSUser.update_at || new Date()
  }
}
