import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'
import { ShadowingSentenceType } from './sv-shadowing.schema'

export type LetterSVSuggestionType = {
  word: string
  feedback_issue: string
  feedback_tip: string
}

export type HisSVUserSentenceType = ShadowingSentenceType & {
  passed: boolean
  enSentence: string
  user_transcript: string
  user_phonetics: string
  user_suggestions: LetterSVSuggestionType[]
  general_feedback: string
}

interface HisSVUserType {
  svShadowingId: ObjectId
  status: StatusLesson
  sentences: HisSVUserSentenceType[]
  create_at?: Date
  update_at?: Date
}

export default class HisSVUser {
  svShadowingId: ObjectId
  status: StatusLesson
  sentences: HisSVUserSentenceType[]
  create_at?: Date
  update_at?: Date

  constructor(hisSVUser: HisSVUserType) {
    this.svShadowingId = hisSVUser.svShadowingId || new ObjectId()
    this.status = hisSVUser.status || StatusLesson.IN_PROGRESS
    this.sentences = hisSVUser.sentences || []
    this.create_at = hisSVUser.create_at || new Date()
    this.update_at = hisSVUser.update_at || new Date()
  }
}
