import { ConfigSystemType } from '~/constants/enum'
import SystemConfig from '~/models/schemas/system-config'
import { databaseService } from './database.service'

class SystemConfigService {
  private pricingConfigCache: SystemConfig | null = null
  private practiceCostConfigCache: SystemConfig | null = null
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

  async loadCache(): Promise<void> {
    await Promise.all([this.getPricingCredit(true), this.getPracticeCost(true)])
  }

  async refreshCache(): Promise<void> {
    this.invalidateCache()
    await this.loadCache()
  }

  invalidateCache(): void {
    this.pricingConfigCache = null
    this.practiceCostConfigCache = null
    this.isCacheLoaded = false
  }

  getCachedPricingCredit(): SystemConfig | null {
    return this.pricingConfigCache
  }

  getCachedPracticeCost(): SystemConfig | null {
    return this.practiceCostConfigCache
  }
}

const systemConfigService = new SystemConfigService()
export default systemConfigService
