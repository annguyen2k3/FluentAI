import { Request, Response } from 'express'
import Admin from '~/models/schemas/admin.schema'
import geminiService from '~/services/gemini.service'
import { HttpStatus } from '~/constants/httpStatus'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import promptService from '~/services/prompt.service'
import { PromptFeature, PromptFeatureType } from '~/constants/enum'
import { databaseService } from '~/services/database.service'
import Prompts from '~/models/schemas/prompts.schema'

config()

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderConfigGeneralController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const activeConfig = await geminiService.getActiveConfig()
  const allConfigs = await geminiService.getAllConfigs()
  res.render('admin/pages/ai-llm/config-general.pug', {
    pageTitle: 'Admin - Cấu hình chung',
    admin,
    prefixAdmin,
    activeConfig,
    allConfigs
  })
}

export const setActiveConfigController = async (
  req: Request,
  res: Response
) => {
  try {
    const { configId } = req.body
    const admin = req.admin as Admin

    if (!configId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Config ID là bắt buộc'
      })
      return
    }

    const result = await geminiService.setActiveConfig(
      new ObjectId(configId),
      admin._id!
    )

    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Config không tồn tại'
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã thay đổi config đang sử dụng thành công'
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi thay đổi config'
    })
  }
}

export const updateConfigController = async (req: Request, res: Response) => {
  try {
    const { configId, name, description, model, config: configData } = req.body
    const admin = req.admin as Admin

    if (!configId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Config ID là bắt buộc'
      })
      return
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (model !== undefined) updateData.model = model
    if (configData !== undefined) updateData.config = configData

    const result = await geminiService.updateConfig(
      new ObjectId(configId),
      admin._id!,
      updateData
    )

    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Config không tồn tại'
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã cập nhật config thành công'
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi cập nhật config'
    })
  }
}

export const duplicateConfigController = async (
  req: Request,
  res: Response
) => {
  try {
    const { configId } = req.body
    const admin = req.admin as Admin

    if (!configId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Config ID là bắt buộc'
      })
      return
    }

    const sourceConfig = await geminiService.getConfigById(
      new ObjectId(configId)
    )

    if (!sourceConfig) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Config không tồn tại'
      })
      return
    }

    let duplicateName = `${sourceConfig.name} (Copy)`
    let counter = 1

    while (true) {
      try {
        const newConfig = await geminiService.createConfig(admin._id!, {
          name: duplicateName,
          description: sourceConfig.description,
          model: sourceConfig.model,
          config: {
            responseMimeType: sourceConfig.config.responseMimeType,
            temperature: sourceConfig.config.temperature,
            maxOutputTokens: sourceConfig.config.maxOutputTokens,
            topP: sourceConfig.config.topP
          }
        })

        res.status(HttpStatus.OK).json({
          status: HttpStatus.OK,
          message: 'Đã duplicate config thành công',
          data: newConfig
        })
        return
      } catch (error: any) {
        if (error.message && error.message.includes('đã tồn tại')) {
          counter++
          duplicateName = `${sourceConfig.name} (Copy ${counter})`
        } else {
          throw error
        }
      }
    }
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi duplicate config'
    })
  }
}

export const deleteConfigController = async (req: Request, res: Response) => {
  try {
    const { configId } = req.body
    const admin = req.admin as Admin

    if (!configId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Config ID là bắt buộc'
      })
      return
    }

    const result = await geminiService.deleteConfig(
      new ObjectId(configId),
      admin._id!
    )

    if (!result) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Config không tồn tại'
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã xóa config thành công'
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi xóa config'
    })
  }
}

export const createConfigController = async (req: Request, res: Response) => {
  try {
    const { name, description, model, config: configData } = req.body
    const admin = req.admin as Admin

    if (!name || !model || !configData) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Tên, Model và Config là bắt buộc'
      })
      return
    }

    if (!configData.responseMimeType || configData.temperature === undefined) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Response MIME Type và Temperature là bắt buộc'
      })
      return
    }

    const newConfig = await geminiService.createConfig(admin._id!, {
      name,
      description,
      model,
      config: {
        responseMimeType: configData.responseMimeType,
        temperature: configData.temperature,
        maxOutputTokens: configData.maxOutputTokens,
        topP: configData.topP
      }
    })

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã tạo config thành công',
      data: newConfig
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi tạo config'
    })
  }
}

// GET /admin/ai-llm/config/test/{configId}
export const testActiveConfigController = async (
  req: Request,
  res: Response
) => {
  try {
    const admin = req.admin as Admin
    const { configId } = req.params

    if (!configId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Config ID là bắt buộc'
      })
      return
    }

    const result = await geminiService.testActiveConfig(new ObjectId(configId))

    if (!result.success) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: result.message
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: result.message
    })
  } catch (error: any) {
    console.error('Test config controller - Error:', error)
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi test config'
    })
  }
}

// GET /admin/ai-llm/prompt-writing
export const renderPromptWritingController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const promptWritingSentences = await promptService.getPromptWithFeature(
    PromptFeature.WRITE_SENTENCE
  )
  const promptWritingParagraphs = await promptService.getPromptWithFeature(
    PromptFeature.WRITE_PARAGRAPH
  )

  const defaultPrompts = await databaseService.prompts
    .find<Prompts>({ title: 'default' })
    .toArray()

  const defaultPromptsMap: Record<string, string[]> = {}
  for (const prompt of defaultPrompts) {
    const key = `${prompt.feature}:${prompt.feature_type}`
    defaultPromptsMap[key] = prompt.replace_variables || []
  }

  res.render('admin/pages/ai-llm/prompt-writing.pug', {
    pageTitle: 'Admin - Cấu hình prompt Writing',
    admin,
    prefixAdmin,
    promptWritingSentences,
    promptWritingParagraphs,
    defaultPromptsMap
  })
}

export const setActivePromptController = async (
  req: Request,
  res: Response
) => {
  try {
    const { promptId } = req.body

    if (!promptId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Prompt ID là bắt buộc'
      })
      return
    }

    const updatedPrompt = await promptService.setActivePrompt(
      new ObjectId(promptId)
    )

    if (!updatedPrompt) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Prompt không tồn tại'
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã cập nhật prompt đang sử dụng thành công'
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi cập nhật prompt active'
    })
  }
}

export const createPromptController = async (req: Request, res: Response) => {
  try {
    const { title, description, feature, feature_type, content, isActive } =
      req.body

    if (!title || !feature || !feature_type || !content) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Title, Feature, Feature Type và Content là bắt buộc'
      })
      return
    }

    if (!Object.values(PromptFeature).includes(feature)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Feature không hợp lệ'
      })
      return
    }

    if (!Object.values(PromptFeatureType).includes(feature_type)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Feature Type không hợp lệ'
      })
      return
    }

    const newPrompt = await promptService.createPrompt({
      title,
      description,
      feature,
      feature_type,
      content,
      isActive
    })

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã tạo prompt thành công',
      data: newPrompt
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi tạo prompt'
    })
  }
}

export const updatePromptController = async (req: Request, res: Response) => {
  try {
    const { promptId, title, description, content, isActive } = req.body

    if (!promptId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Prompt ID là bắt buộc'
      })
      return
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (content !== undefined) updateData.content = content
    if (isActive !== undefined) updateData.isActive = isActive

    const updated = await promptService.updatePrompt(
      new ObjectId(promptId),
      updateData
    )

    if (!updated) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Prompt không tồn tại'
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã cập nhật prompt thành công'
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi cập nhật prompt'
    })
  }
}

export const deletePromptController = async (req: Request, res: Response) => {
  try {
    const { promptId } = req.body

    if (!promptId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Prompt ID là bắt buộc'
      })
      return
    }

    const deleted = await promptService.deletePrompt(new ObjectId(promptId))

    if (!deleted) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        message: 'Prompt không tồn tại'
      })
      return
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Đã xóa prompt thành công'
    })
  } catch (error: any) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Có lỗi xảy ra khi xóa prompt'
    })
  }
}
