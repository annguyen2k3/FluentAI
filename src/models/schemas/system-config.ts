import { ObjectId } from 'mongodb'
import {
  ConfigSystemType,
  CreditUsageType,
  UserScoreType
} from '~/constants/enum'

export interface PricingCreditType {
  parameters: {
    _id: ObjectId
    price: number
    discount: number
    credit: number
  }[]
  create_at?: Date
  update_at?: Date
  updated_by?: ObjectId
}

export interface PracticeCostType {
  parameters: {
    _id: ObjectId
    type: CreditUsageType
    cost: number
  }[]
  create_at?: Date
  update_at?: Date
  updated_by?: ObjectId
}

export interface PracticeScoreType {
  parameters: {
    _id: ObjectId
    type: UserScoreType
    score: number
    description?: string
  }[]
  create_at?: Date
  update_at?: Date
  updated_by?: ObjectId
}

export interface SystemConfigType {
  _id?: ObjectId
  type: ConfigSystemType
  config: PricingCreditType | PracticeCostType | PracticeScoreType
}

export default class SystemConfig {
  _id?: ObjectId
  type: ConfigSystemType
  config: PricingCreditType | PracticeCostType | PracticeScoreType

  constructor(systemConfig: SystemConfigType) {
    this._id = systemConfig._id || new ObjectId()
    this.type = systemConfig.type
    this.config = systemConfig.config
  }
}
