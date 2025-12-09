import { ObjectId } from 'mongodb'
import { UserScoreType } from '~/constants/enum'

interface ScoreConfigType {
  userScoreType: UserScoreType
  baseScore: number
  description?: string
}

interface SystemScoreType {
  _id?: ObjectId
  name: string
  description?: string
  scoreConfigs: ScoreConfigType[]
  isActive: boolean
  create_at?: Date
  update_at?: Date
  created_by?: ObjectId
  updated_by?: ObjectId
}

export default class SystemScore {
  _id?: ObjectId
  name: string
  description?: string
  scoreConfigs: ScoreConfigType[]
  isActive: boolean
  create_at?: Date
  update_at?: Date
  created_by?: ObjectId
  updated_by?: ObjectId

  constructor(systemScore: SystemScoreType) {
    this._id = systemScore._id || new ObjectId()
    this.name = systemScore.name || 'Default Score System'
    this.description = systemScore.description || ''
    this.scoreConfigs = systemScore.scoreConfigs || []
    this.isActive = systemScore.isActive || false
    this.create_at = systemScore.create_at || new Date()
    this.update_at = systemScore.update_at || new Date()
    this.created_by = systemScore.created_by
    this.updated_by = systemScore.updated_by
  }
}
