import { ConfigSystemType } from '~/constants/enum'
import SystemConfig from '~/models/schemas/system-config'
import { databaseService } from './database.service'

class SystemConfigService {
  private pricingConfigCache: SystemConfig | null = null
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

  async loadCache(): Promise<SystemConfig | null> {
    return await this.getPricingCredit(true)
  }

  async refreshCache(): Promise<SystemConfig | null> {
    this.invalidateCache()
    return await this.loadCache()
  }

  invalidateCache(): void {
    this.pricingConfigCache = null
    this.isCacheLoaded = false
  }

  getCachedPricingCredit(): SystemConfig | null {
    return this.pricingConfigCache
  }
}

const systemConfigService = new SystemConfigService()
export default systemConfigService
