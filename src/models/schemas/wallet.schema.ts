import { ObjectId } from 'mongodb'
import { TransactionStatus } from '~/constants/enum'
import { databaseService } from '~/services/database.service'

interface TransactionType {
  _id?: ObjectId
  title: string
  price: number
  credit: number
  description?: string
  status: TransactionStatus
  link_payment?: string
  create_at?: Date
  update_at?: Date
}

export interface WalletType {
  _id?: ObjectId
  balance_credit?: number
  history_transactions?: TransactionType[]
  update_at?: Date
}

export default class Wallet {
  _id?: ObjectId
  balance_credit?: number
  history_transactions?: TransactionType[]
  update_at?: Date
  async createWallet() {
    await databaseService.wallets.insertOne(this)
  }

  constructor(wallet: WalletType) {
    const giftFree = 100

    this._id = wallet._id || new ObjectId()
    this.balance_credit = wallet.balance_credit || giftFree
    this.history_transactions = wallet.history_transactions || [
      {
        _id: new ObjectId(),
        title: 'Tặng credit trải nghiệm cho người dùng mới',
        price: 0,
        credit: giftFree,
        description: 'Successfully.',
        status: TransactionStatus.SUCCESS,
        create_at: new Date(),
        update_at: new Date()
      }
    ]
    this.update_at = wallet.update_at || new Date()
  }
}
