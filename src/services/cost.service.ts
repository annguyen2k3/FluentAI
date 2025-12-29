import User from '~/models/schemas/users.schema'
import { CreditUsageType } from '~/constants/enum'
import systemConfigService from './system-config.service'
import { databaseService } from './database.service'
import { ObjectId } from 'mongodb'
import { PracticeCostType } from '~/models/schemas/system-config'
import Wallet from '~/models/schemas/wallet.schema'

class CostService {
  async checkWalletBalance({
    wallet_id,
    type
  }: {
    wallet_id: string
    type: CreditUsageType
  }): Promise<{
    success: boolean
    message: string
    wallet: Wallet | null
    costPractice: number | null
  }> {
    const wallet = await databaseService.wallets.findOne({
      _id: new ObjectId(wallet_id)
    })
    if (!wallet) {
      return {
        success: false,
        message: 'Ví không tồn tại',
        wallet: null,
        costPractice: null
      }
    }

    const balanceCredit = wallet.balance_credit || 0
    const practiceCostConfig = systemConfigService.getCachedPracticeCost()
    if (!practiceCostConfig) {
      return {
        success: false,
        message: 'Cấu hình chi phí thực hành không tồn tại',
        wallet: wallet,
        costPractice: null
      }
    }

    const config = practiceCostConfig.config as PracticeCostType
    const costParameter = config.parameters.find(
      (p: { type: CreditUsageType; cost: number }) => p.type === type
    )

    if (!costParameter || !costParameter.cost) {
      return {
        success: false,
        message: 'Không tìm thấy cấu hình chi phí cho loại bài luyện tập này',
        wallet: wallet,
        costPractice: null
      }
    }

    const cost = costParameter.cost

    if (balanceCredit < cost) {
      return {
        success: false,
        message: `Số dư không đủ. Vui lòng nạp thêm credit.`,
        wallet: wallet,
        costPractice: cost
      }
    }

    return {
      success: true,
      message: 'Số dư đủ',
      wallet: wallet,
      costPractice: cost
    }
  }

  async handlePracticeCost({
    wallet,
    costPractice = 0
  }: {
    wallet: Wallet
    costPractice: number
  }): Promise<boolean> {
    if (!wallet.balance_credit) return false
    const newBalance = wallet.balance_credit - costPractice

    wallet.balance_credit = newBalance
    await databaseService.wallets.updateOne(
      { _id: wallet._id },
      { $set: wallet }
    )

    return true
  }

  async getPracticeCost(type: CreditUsageType): Promise<number> {
    let practiceCostConfig = systemConfigService.getCachedPracticeCost()
    if (!practiceCostConfig) {
      practiceCostConfig = await systemConfigService.getPracticeCost(false)
    }
    if (!practiceCostConfig) {
      console.log('[getPracticeCost] No practice cost config found')
      return 0
    }
    const cost = practiceCostConfig.config as PracticeCostType
    if (!cost || !cost.parameters) {
      console.log('[getPracticeCost] Invalid config structure:', cost)
      return 0
    }
    const costParameter = cost.parameters.find(
      (p: { type: CreditUsageType; cost: number }) => p.type === type
    )
    if (!costParameter) {
      console.log('[getPracticeCost] No parameter found for type:', type)
      console.log(
        '[getPracticeCost] Available parameters:',
        cost.parameters.map((p) => ({ type: p.type, cost: p.cost }))
      )
      return 0
    }
    return costParameter.cost || 0
  }
}

const costService = new CostService()
export default costService
