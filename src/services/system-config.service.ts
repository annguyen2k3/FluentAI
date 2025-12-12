import {
  ConfigSystemType,
  UserScoreType,
  CreditUsageType
} from '~/constants/enum'
import SystemConfig, {
  PracticeScoreType,
  PracticeCostType
} from '~/models/schemas/system-config'
import { databaseService } from './database.service'
import { ObjectId } from 'mongodb'

class SystemConfigService {
  private pricingConfigCache: SystemConfig | null = null
  private practiceCostConfigCache: SystemConfig | null = null
  private practiceScoreConfigCache: SystemConfig | null = null
  private isCacheLoaded: boolean = false

  private defaultPracticeScoreConfig: Record<UserScoreType, number> = {
    [UserScoreType.WRITING_SENTENCE]: 10,
    [UserScoreType.WRITING_PARAGRAPH]: 10,
    [UserScoreType.SPEAKING_SENTENCE]: 15,
    [UserScoreType.SPEAKING_SHADOWING]: 15,
    [UserScoreType.LISTENING_VIDEO]: 30
  }

  async getPricingCredit(
    forceRefresh: boolean = false
  ): Promise<SystemConfig | null> {
    if (!forceRefresh && this.isCacheLoaded && this.pricingConfigCache) {
      return this.pricingConfigCache
    }

    const config = await databaseService.systemConfigs.findOne<SystemConfig>({
      type: ConfigSystemType.PRICING_CREDIT
    })

    this.pricingConfigCache = config
    this.isCacheLoaded = true

    return config
  }

  async getPracticeCost(
    forceRefresh: boolean = false
  ): Promise<SystemConfig | null> {
    if (!forceRefresh && this.isCacheLoaded && this.practiceCostConfigCache) {
      return this.practiceCostConfigCache
    }

    const config = await databaseService.systemConfigs.findOne<SystemConfig>({
      type: ConfigSystemType.COST_USAGE
    })

    this.practiceCostConfigCache = config
    this.isCacheLoaded = true

    return config
  }

  async getPracticeScore(
    forceRefresh: boolean = false
  ): Promise<SystemConfig | null> {
    if (!forceRefresh && this.isCacheLoaded && this.practiceScoreConfigCache) {
      return this.practiceScoreConfigCache
    }

    let config = await databaseService.systemConfigs.findOne<SystemConfig>({
      type: ConfigSystemType.PRACTICE_SCORE
    })

    if (!config) {
      const practiceScoreConfig: PracticeScoreType = {
        parameters: Object.entries(this.defaultPracticeScoreConfig).map(
          ([type, score]) => ({
            _id: new ObjectId(),
            type: type as UserScoreType,
            score
          })
        ),
        create_at: new Date(),
        update_at: new Date(),
        updated_by: undefined
      }
      config = new SystemConfig({
        type: ConfigSystemType.PRACTICE_SCORE,
        config: practiceScoreConfig
      })
      await databaseService.systemConfigs.insertOne(config)
    }

    this.practiceScoreConfigCache = config
    this.isCacheLoaded = true

    return config
  }

  async loadCache(): Promise<void> {
    await Promise.all([
      this.getPricingCredit(true),
      this.getPracticeCost(true),
      this.getPracticeScore(true)
    ])
  }

  async refreshCache(): Promise<void> {
    this.invalidateCache()
    await this.loadCache()
  }

  async refreshPracticeScoreCache(): Promise<SystemConfig | null> {
    this.invalidatePracticeScoreCache()
    return this.getPracticeScore(true)
  }

  invalidateCache(): void {
    this.pricingConfigCache = null
    this.practiceCostConfigCache = null
    this.practiceScoreConfigCache = null
    this.isCacheLoaded = false
  }

  invalidatePracticeScoreCache(): void {
    this.practiceScoreConfigCache = null
    this.isCacheLoaded = false
  }

  getCachedPricingCredit(): SystemConfig | null {
    return this.pricingConfigCache
  }

  getCachedPracticeCost(): SystemConfig | null {
    return this.practiceCostConfigCache
  }

  getCachedPracticeScore(): SystemConfig | null {
    return this.practiceScoreConfigCache
  }

  async updatePracticeScoreConfig(
    adminId: ObjectId,
    record: Record<UserScoreType, number>
  ): Promise<Boolean> {
    const practiceScoreConfig = this.getCachedPracticeScore()
    if (!practiceScoreConfig) {
      return false
    }
    const config = practiceScoreConfig.config as PracticeScoreType
    config.parameters = Object.entries(record).map(([type, score]) => ({
      _id: new ObjectId(),
      type: type as UserScoreType,
      score
    }))
    config.updated_by = adminId
    config.update_at = new Date()
    await databaseService.systemConfigs.updateOne(
      { _id: practiceScoreConfig._id },
      { $set: { config: config } }
    )
    this.invalidatePracticeScoreCache()
    return true
  }

  async updatePracticeCostConfig(
    adminId: ObjectId,
    record: Record<CreditUsageType, number>
  ): Promise<Boolean> {
    const practiceCostConfig = this.getCachedPracticeCost()
    if (!practiceCostConfig) {
      return false
    }
    const config = practiceCostConfig.config as PracticeCostType
    config.parameters = Object.entries(record).map(([type, cost]) => ({
      _id: new ObjectId(),
      type: type as CreditUsageType,
      cost
    }))
    config.updated_by = adminId
    config.update_at = new Date()
    await databaseService.systemConfigs.updateOne(
      { _id: practiceCostConfig._id },
      { $set: { config: config } }
    )
    this.practiceCostConfigCache = null
    return true
  }
}

const systemConfigService = new SystemConfigService()
export default systemConfigService
