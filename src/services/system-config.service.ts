import { ConfigSystemType } from '~/constants/enum'
import SystemConfig from '~/models/schemas/system-config'
import { databaseService } from './database.service'

class SystemConfigService {
  private pricingConfigCache: SystemConfig | null = null
  private practiceCostConfigCache: SystemConfig | null = null
  private practiceScoreConfigCache: SystemConfig | null = null
  private isCacheLoaded: boolean = false

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

    const config = await databaseService.systemConfigs.findOne<SystemConfig>({
      type: ConfigSystemType.PRACTICE_SCORE
    })

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
}

const systemConfigService = new SystemConfigService()
export default systemConfigService
