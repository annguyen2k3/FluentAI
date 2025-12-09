import { ObjectId } from 'mongodb'
import { UserScoreType } from '~/constants/enum'

interface ScoreInfoType {
  type: UserScoreType
  idPractice?: ObjectId
  title: string
  score: number
  create_at?: Date
}

interface UserScoreItemType {
  _id?: ObjectId
  userId: ObjectId
  year: number
  month: number
  day: number
  scores: ScoreInfoType[]
  create_at?: Date
  update_at?: Date
}

export default class UserScore {
  _id?: ObjectId
  userId: ObjectId
  year: number
  month: number
  day: number
  scores: ScoreInfoType[]
  create_at?: Date
  update_at?: Date

  constructor(userScore: UserScoreItemType) {
    this._id = userScore._id || new ObjectId()
    this.userId = userScore.userId
    this.year = userScore.year || new Date().getFullYear()
    this.month = userScore.month || new Date().getMonth() + 1
    this.day = userScore.day || new Date().getDate()
    this.scores = userScore.scores || []
    this.create_at = userScore.create_at || new Date()
    this.update_at = userScore.update_at || new Date()
  }
}
