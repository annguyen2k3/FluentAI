import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import Prompts from '~/models/schemas/prompts.schema'
import { PromptFeature, PromptFeatureType } from '~/constants/enum'
import { databaseService } from './database.service'

class PromptService {
  private promptCache: Map<string, Prompts> = new Map()
  private isCacheLoaded = false

  private getCacheKey(feature: PromptFeature, featureType: PromptFeatureType) {
    return `${feature}:${featureType}`
  }

  private async fetchPrompt(
    feature: PromptFeature,
    featureType: PromptFeatureType
  ): Promise<Prompts> {
    const doc = await databaseService.prompts.findOne<Prompts>({
      feature,
      feature_type: featureType,
      isActive: true
    })

    if (!doc?.content) {
      throw new ErrorWithStatus(
        `Prompt not found: ${featureType}`,
        HttpStatus.NOT_FOUND
      )
    }

    return new Prompts(doc)
  }

  private setCache(prompts: Prompts[]) {
    this.promptCache.clear()
    for (const prompt of prompts) {
      const key = this.getCacheKey(prompt.feature, prompt.feature_type)
      this.promptCache.set(key, prompt)
    }
  }

  async loadCache(): Promise<void> {
    const activePrompts = await databaseService.prompts
      .find<Prompts>({ isActive: true })
      .toArray()

    this.setCache(activePrompts)
    this.isCacheLoaded = true
  }

  async refreshCache(): Promise<void> {
    this.invalidateCache()
    await this.loadCache()
  }

  invalidateCache(): void {
    this.promptCache.clear()
    this.isCacheLoaded = false
  }

  getCachedPrompt(
    feature: PromptFeature,
    featureType: PromptFeatureType
  ): Prompts | null {
    const key = this.getCacheKey(feature, featureType)
    return this.promptCache.get(key) || null
  }

  async getPromptContent(
    feature: PromptFeature,
    featureType: PromptFeatureType,
    forceRefresh = false
  ): Promise<string> {
    if (forceRefresh) {
      this.invalidateCache()
    }

    if (!this.isCacheLoaded) {
      await this.loadCache()
    }

    const key = this.getCacheKey(feature, featureType)
    if (!forceRefresh && this.promptCache.has(key)) {
      return this.promptCache.get(key)!.content
    }

    const prompt = await this.fetchPrompt(feature, featureType)
    this.promptCache.set(key, prompt)
    this.isCacheLoaded = true
    return prompt.content
  }
}

const promptService = new PromptService()
export default promptService
