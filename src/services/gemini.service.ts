import GeminiConfig from '~/models/schemas/gemini-config.schema'
import { databaseService } from './database.service'
import { ObjectId } from 'mongodb'
import { GoogleGenAI } from '@google/genai'

class GeminiService {
  private activeConfigCache: GeminiConfig | null = null
  private isCacheLoaded: boolean = false

  private readonly DEFAULT_CONFIG_NAME = 'default'

  private getDefaultConfigData(): GeminiConfig {
    return new GeminiConfig({
      name: this.DEFAULT_CONFIG_NAME,
      description: 'Config mặc định',
      model: 'gemini-2.5-flash-lite',
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 2000,
        topP: 0.95
      },
      isActive: true,
      create_at: new Date(),
      update_at: new Date()
    })
  }

  async getActiveConfig(forceRefresh: boolean = false): Promise<GeminiConfig> {
    if (!forceRefresh && this.isCacheLoaded && this.activeConfigCache) {
      return this.activeConfigCache
    }

    let config = await databaseService.geminiConfigs.findOne<GeminiConfig>({
      isActive: true
    })

    if (!config) {
      const defaultConfig =
        await databaseService.geminiConfigs.findOne<GeminiConfig>({
          name: this.DEFAULT_CONFIG_NAME
        })

      if (!defaultConfig) {
        const newDefaultConfig = this.getDefaultConfigData()
        await databaseService.geminiConfigs.insertOne(newDefaultConfig)
        config = newDefaultConfig
      } else {
        await databaseService.geminiConfigs.updateOne(
          { _id: defaultConfig._id },
          { $set: { isActive: true, update_at: new Date() } }
        )
        config = await databaseService.geminiConfigs.findOne<GeminiConfig>({
          _id: defaultConfig._id
        })
      }
    }

    this.activeConfigCache = config
    this.isCacheLoaded = true

    return config!
  }

  async getAllConfigs(): Promise<GeminiConfig[]> {
    const configs = await databaseService.geminiConfigs
      .find<GeminiConfig>({})
      .toArray()

    return configs
  }

  async getConfigById(configId: ObjectId): Promise<GeminiConfig | null> {
    const config = await databaseService.geminiConfigs.findOne<GeminiConfig>({
      _id: configId
    })

    return config || null
  }

  async loadCache(): Promise<void> {
    await this.getActiveConfig(true)
  }

  async refreshCache(): Promise<void> {
    this.invalidateCache()
    await this.loadCache()
  }

  invalidateCache(): void {
    this.activeConfigCache = null
    this.isCacheLoaded = false
  }

  getCachedActiveConfig(): GeminiConfig | null {
    return this.activeConfigCache
  }

  async createConfig(
    adminId: ObjectId,
    configData: {
      name: string
      description?: string
      model: string
      config: {
        responseMimeType: string
        temperature: number
        maxOutputTokens?: number
        topP?: number
      }
    }
  ): Promise<GeminiConfig> {
    if (configData.name === this.DEFAULT_CONFIG_NAME) {
      throw new Error('Không thể tạo config với name "default"')
    }

    const existingConfig =
      await databaseService.geminiConfigs.findOne<GeminiConfig>({
        name: configData.name
      })

    if (existingConfig) {
      throw new Error(`Config với name "${configData.name}" đã tồn tại`)
    }

    const newConfig = new GeminiConfig({
      name: configData.name,
      description: configData.description,
      model: configData.model,
      config: configData.config,
      isActive: false,
      create_at: new Date(),
      update_at: new Date(),
      updated_by: adminId
    })

    await databaseService.geminiConfigs.insertOne(newConfig)

    return newConfig
  }

  async updateConfig(
    configId: ObjectId,
    adminId: ObjectId,
    updateData: {
      name?: string
      description?: string
      model?: string
      config?: {
        responseMimeType?: string
        temperature?: number
        maxOutputTokens?: number
        topP?: number
      }
    }
  ): Promise<boolean> {
    const existingConfig =
      await databaseService.geminiConfigs.findOne<GeminiConfig>({
        _id: configId
      })

    if (!existingConfig) {
      return false
    }

    if (existingConfig.name === this.DEFAULT_CONFIG_NAME) {
      throw new Error('Không thể sửa config mặc định')
    }

    if (
      updateData.name !== undefined &&
      updateData.name !== existingConfig.name
    ) {
      if (updateData.name === this.DEFAULT_CONFIG_NAME) {
        throw new Error('Không thể đổi name thành "default"')
      }

      const nameExists =
        await databaseService.geminiConfigs.findOne<GeminiConfig>({
          name: updateData.name
        })

      if (nameExists) {
        throw new Error(`Config với name "${updateData.name}" đã tồn tại`)
      }
    }

    const updateFields: Partial<GeminiConfig> = {
      update_at: new Date(),
      updated_by: adminId
    }

    if (updateData.name !== undefined) {
      updateFields.name = updateData.name
    }
    if (updateData.description !== undefined) {
      updateFields.description = updateData.description
    }
    if (updateData.model !== undefined) {
      updateFields.model = updateData.model
    }
    if (updateData.config !== undefined) {
      updateFields.config = {
        ...existingConfig.config,
        ...updateData.config
      }
    }

    await databaseService.geminiConfigs.updateOne(
      { _id: configId },
      { $set: updateFields }
    )

    return true
  }

  async deleteConfig(configId: ObjectId, adminId: ObjectId): Promise<boolean> {
    const config = await databaseService.geminiConfigs.findOne<GeminiConfig>({
      _id: configId
    })

    if (!config) {
      return false
    }

    if (config.name === this.DEFAULT_CONFIG_NAME) {
      throw new Error('Không thể xóa config mặc định')
    }

    const wasActive = config.isActive

    const result = await databaseService.geminiConfigs.deleteOne({
      _id: configId
    })

    if (result.deletedCount > 0) {
      if (wasActive) {
        await this.setActiveConfigByName(this.DEFAULT_CONFIG_NAME, adminId)
      }

      this.invalidateCache()
      return true
    }

    return false
  }

  async setActiveConfig(
    configId: ObjectId,
    adminId: ObjectId
  ): Promise<boolean> {
    const config = await databaseService.geminiConfigs.findOne<GeminiConfig>({
      _id: configId
    })

    if (!config) {
      return false
    }

    await databaseService.geminiConfigs.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    )

    await databaseService.geminiConfigs.updateOne(
      { _id: configId },
      {
        $set: {
          isActive: true,
          update_at: new Date(),
          updated_by: adminId
        }
      }
    )

    this.invalidateCache()
    await this.getActiveConfig(true)

    return true
  }

  async setActiveConfigByName(
    name: string,
    adminId: ObjectId
  ): Promise<boolean> {
    const config = await databaseService.geminiConfigs.findOne<GeminiConfig>({
      name: name
    })

    if (!config) {
      return false
    }

    await databaseService.geminiConfigs.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    )

    await databaseService.geminiConfigs.updateOne(
      { _id: config._id },
      {
        $set: {
          isActive: true,
          update_at: new Date(),
          updated_by: adminId
        }
      }
    )

    this.invalidateCache()
    await this.getActiveConfig(true)

    return true
  }

  async testActiveConfig(configId: ObjectId) {
    const config = await this.getConfigById(configId)

    if (!config) {
      return {
        success: false,
        message: 'Config không tồn tại'
      }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
      const res = await ai.chats
        .create({
          model: config.model,
          config: config.config
        })
        .sendMessage({
          message:
            'If you can see this message, the config is working and output is only JSON format { "success": true }'
        })

      const resText = JSON.parse(res.text || '{}')

      if (resText.success !== true) {
        const errorMessage =
          resText.message || 'API không hoạt động với config này.'

        await databaseService.geminiConfigs.updateOne(
          { _id: configId },
          {
            $set: {
              test_config: {
                success: false,
                message: errorMessage,
                test_at: new Date()
              }
            }
          }
        )
        return {
          success: false,
          message: errorMessage
        }
      }

      const successMessage = res.text || 'Hoạt động'

      await databaseService.geminiConfigs.updateOne(
        { _id: configId },
        {
          $set: {
            test_config: {
              success: true,
              message: successMessage,
              test_at: new Date()
            }
          }
        }
      )

      return {
        success: true,
        message: 'API hoạt động với config này.'
      }
    } catch (error: any) {
      let errorMessage = 'Có lỗi xảy ra khi test config'

      if (error?.error?.message) {
        errorMessage = String(error.error.message)
      } else if (error?.message) {
        errorMessage = String(error.message)
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error) {
        try {
          const errorStr = JSON.stringify(error)
          if (errorStr && errorStr !== '{}') {
            const parsed = JSON.parse(errorStr)
            if (parsed?.error?.message) {
              errorMessage = String(parsed.error.message)
            } else if (parsed?.message) {
              errorMessage = String(parsed.message)
            }
          }
        } catch {
          errorMessage = String(error)
        }
      }

      const cleanErrorMessage = errorMessage.trim()

      try {
        await databaseService.geminiConfigs.updateOne(
          { _id: configId },
          {
            $set: {
              test_config: {
                success: false,
                message: cleanErrorMessage,
                test_at: new Date()
              }
            }
          }
        )
      } catch (dbError) {}

      return {
        success: false,
        message: cleanErrorMessage
      }
    }
  }
}

const geminiService = new GeminiService()
export default geminiService
