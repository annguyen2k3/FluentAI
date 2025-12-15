import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import Prompts from '~/models/schemas/prompts.schema'
import { PromptFeature, PromptFeatureType } from '~/constants/enum'
import { databaseService } from './database.service'
import { ObjectId } from 'mongodb'

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

  async getPromptWithFeature(feature: PromptFeature): Promise<Prompts[]> {
    return await databaseService.prompts
      .find<Prompts>({ feature })
      .sort({ create_at: -1 })
      .toArray()
  }

  async setActivePrompt(promptId: ObjectId): Promise<Prompts | null> {
    const prompt = await databaseService.prompts.findOne<Prompts>({
      _id: promptId
    })

    if (!prompt) return null

    await databaseService.prompts.updateMany(
      { feature: prompt.feature, feature_type: prompt.feature_type },
      { $set: { isActive: false, update_at: new Date() } }
    )

    await databaseService.prompts.updateOne(
      { _id: promptId },
      { $set: { isActive: true, update_at: new Date() } }
    )

    await this.refreshCache()
    return await databaseService.prompts.findOne<Prompts>({ _id: promptId })
  }

  private async ensureAnotherActive(
    feature: PromptFeature,
    featureType: PromptFeatureType,
    excludeId?: ObjectId
  ) {
    const otherActive = await databaseService.prompts.findOne<Prompts>({
      feature,
      feature_type: featureType,
      isActive: true,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    })

    if (!otherActive) {
      throw new Error(
        'Cần tối thiểu 1 prompt đang hoạt động cho từng feature type'
      )
    }
  }

  async createPrompt(data: {
    title: string
    description?: string
    feature: PromptFeature
    feature_type: PromptFeatureType
    content: string
    replace_variables?: string[]
    isActive?: boolean
  }): Promise<Prompts> {
    const now = new Date()
    const newPrompt = new Prompts({
      ...data,
      replace_variables: data.replace_variables || [],
      isActive: data.isActive ?? false,
      create_at: now,
      update_at: now
    })

    if (newPrompt.isActive) {
      await databaseService.prompts.updateMany(
        { feature: newPrompt.feature, feature_type: newPrompt.feature_type },
        { $set: { isActive: false, update_at: now } }
      )
    }

    await databaseService.prompts.insertOne(newPrompt)

    if (!newPrompt.isActive) {
      await this.ensureAnotherActive(
        newPrompt.feature,
        newPrompt.feature_type,
        newPrompt._id!
      ).catch(async () => {
        await databaseService.prompts.updateOne(
          { _id: newPrompt._id },
          { $set: { isActive: true, update_at: new Date() } }
        )
      })
    }

    await this.refreshCache()
    return newPrompt
  }

  async updatePrompt(
    promptId: ObjectId,
    data: Partial<{
      title: string
      description: string
      content: string
      replace_variables: string[]
      isActive: boolean
    }>
  ): Promise<boolean> {
    const prompt = await databaseService.prompts.findOne<Prompts>({
      _id: promptId
    })

    if (!prompt) return false
    if (prompt.title === 'default') {
      throw new ErrorWithStatus(
        'Không thể sửa prompt default',
        HttpStatus.BAD_REQUEST
      )
    }

    const now = new Date()
    const updateFields: Partial<Prompts> = { update_at: now }

    if (data.title !== undefined) updateFields.title = data.title
    if (data.description !== undefined)
      updateFields.description = data.description
    if (data.content !== undefined) updateFields.content = data.content
    if (data.replace_variables !== undefined)
      updateFields.replace_variables = data.replace_variables

    if (data.isActive === true) {
      await databaseService.prompts.updateMany(
        { feature: prompt.feature, feature_type: prompt.feature_type },
        { $set: { isActive: false, update_at: now } }
      )
      updateFields.isActive = true
    } else if (data.isActive === false && prompt.isActive) {
      await this.ensureAnotherActive(
        prompt.feature,
        prompt.feature_type,
        promptId
      )
      updateFields.isActive = false
    }

    await databaseService.prompts.updateOne(
      { _id: promptId },
      { $set: updateFields }
    )

    await this.refreshCache()
    return true
  }

  async deletePrompt(promptId: ObjectId): Promise<boolean> {
    const prompt = await databaseService.prompts.findOne<Prompts>({
      _id: promptId
    })

    if (!prompt) return false

    if (prompt.title === 'default') {
      throw new ErrorWithStatus(
        'Không thể xóa prompt default',
        HttpStatus.BAD_REQUEST
      )
    }

    if (prompt.isActive) {
      const another = await databaseService.prompts.findOne<Prompts>({
        feature: prompt.feature,
        feature_type: prompt.feature_type,
        isActive: true,
        _id: { $ne: promptId }
      })

      if (!another) {
        throw new Error(
          'Không thể xóa vì đây là prompt active duy nhất của feature type này'
        )
      }
    }

    await databaseService.prompts.deleteOne({ _id: promptId })
    await this.refreshCache()
    return true
  }
}

const promptService = new PromptService()
export default promptService
