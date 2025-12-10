import { ObjectId } from 'mongodb'
import { ConfigSystemType } from '~/constants/enum'

interface PricingCreditType {
  parameters: {
    _id: ObjectId
    price: number
    discount: number
    credit: number
  }[]
  create_at?: Date
  update_at?: Date
}

export interface SystemConfigType {
  _id?: ObjectId
  type: ConfigSystemType
  config: PricingCreditType
}

export default class SystemConfig {
  _id?: ObjectId
  type: ConfigSystemType
  config: PricingCreditType

  constructor(systemConfig: SystemConfigType) {
    this._id = systemConfig._id || new ObjectId()
    this.type = systemConfig.type
    this.config = systemConfig.config
  }
}
