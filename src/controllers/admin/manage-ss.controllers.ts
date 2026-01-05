import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import SSList from '~/models/schemas/ss-list.schema'
import categoriesServices from '~/services/categories.service'
import speakingServices from '~/services/speaking.service'
import { databaseService } from '~/services/database.service'
import excelService from '~/services/excel.service'
import { handleUploadExcel } from '~/utils/file'
import { createSlug } from '~/utils/format'

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderManageSsController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const topics = (await categoriesServices.getTopics()).map((topic) => ({
    _id: topic._id?.toString() || '',
    title: topic.title,
    slug: topic.slug,
    pos: topic.pos
  }))
  const levels = (await categoriesServices.getLevels()).map((level) => ({
    _id: level._id?.toString() || '',
    title: level.title,
    slug: level.slug,
    pos: level.pos
  }))

  res.render('admin/pages/manage-ss.pug', {
    pageTitle: 'Admin - Quản lý luyện phát âm câu',
    admin,
    topics,
    levels,
    prefixAdmin
  })
}

export const getListSsController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const levelParam = req.query.level as string | undefined
  const topicParam = req.query.topic as string | undefined
  const isActiveParam = req.query.isActive as string | undefined
  const searchParam = req.query.search as string | undefined
  const sortKeyParam = req.query.sortKey as string | undefined
  const sortOrderParam = req.query.sortOrder as 'asc' | 'desc' | undefined

  const search = searchParam ? searchParam.trim() : ''
  const sortKey = sortKeyParam ? sortKeyParam.trim() : 'pos'
  const sortOrder = sortOrderParam
    ? (sortOrderParam.trim() as 'asc' | 'desc')
    : 'asc'

  const level =
    levelParam && ObjectId.isValid(levelParam)
      ? new ObjectId(levelParam)
      : undefined
  const topic =
    topicParam && ObjectId.isValid(topicParam)
      ? new ObjectId(topicParam)
      : undefined
  const isActive =
    isActiveParam !== undefined && isActiveParam !== ''
      ? isActiveParam === 'true'
      : undefined

  const data = await speakingServices.getSSList({
    page,
    limit,
    level,
    topic,
    isActive,
    search,
    sortKey,
    sortOrder
  })
  res.status(HttpStatus.OK).json({
    message: 'Danh sách nội dung phát âm câu đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

export const createSSListController = async (req: Request, res: Response) => {
  const { title, topic, level, list, pos, slug, isActive } = req.body
  const ssList = new SSList({
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    list,
    pos: Number(pos),
    slug,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  })
  await speakingServices.createSSList(ssList)
  res.status(HttpStatus.CREATED).json({
    message: 'Nội dung phát âm câu đã được tạo thành công',
    status: HttpStatus.CREATED,
    ssList
  })
}

export const updateSSListController = async (req: Request, res: Response) => {
  const { id, title, topic, level, list, pos, slug, isActive } = req.body
  const existingSSList = await databaseService.ssLists.findOne({
    _id: new ObjectId(id)
  })
  if (!existingSSList) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Nội dung phát âm câu không tồn tại'
    })
    return
  }
  const ssList = new SSList({
    _id: new ObjectId(id),
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    list,
    pos: Number(pos),
    slug,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    create_at: existingSSList.create_at,
    update_at: new Date()
  })
  await speakingServices.updateSSList(ssList)
  res.status(HttpStatus.OK).json({
    message: 'Nội dung phát âm câu đã được cập nhật thành công',
    status: HttpStatus.OK,
    ssList
  })
}

export const deleteSSListController = async (req: Request, res: Response) => {
  const { id } = req.body
  const ssList = await databaseService.ssLists.findOne({
    _id: new ObjectId(id)
  })
  if (!ssList) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Nội dung phát âm câu không tồn tại'
    })
    return
  }
  await databaseService.ssLists.deleteOne({ _id: new ObjectId(id) })
  res.status(HttpStatus.OK).json({
    message: 'Nội dung phát âm câu đã được xóa thành công',
    status: HttpStatus.OK
  })
}

// GET /admin/speaking-sentence/import
export const renderImportSsController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const topics = (await categoriesServices.getTopics()).map((topic) => ({
    _id: topic._id?.toString() || '',
    title: topic.title,
    slug: topic.slug,
    pos: topic.pos
  }))
  const levels = (await categoriesServices.getLevels()).map((level) => ({
    _id: level._id?.toString() || '',
    title: level.title,
    slug: level.slug,
    pos: level.pos
  }))
  res.render('admin/pages/import-excel/import-ss.pug', {
    pageTitle: 'Admin - Import luyện phát âm câu',
    admin,
    prefixAdmin,
    topics,
    levels
  })
}

// GET /admin/speaking-sentence/export-template
export const downloadSSTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const buffer = await excelService.createSSTemplate()
    const filename = `ss-list-template-${Date.now()}.xlsx`

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(buffer)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const isDevelopment = process.env.NODE_ENV !== 'production'

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Không thể tạo file template',
      error: errorMessage,
      ...(isDevelopment && errorStack && { stack: errorStack }),
      ...(error instanceof Error && { errorName: error.name })
    })
  }
}

// POST /admin/speaking-sentence/import
export const importSSListController = async (req: Request, res: Response) => {
  try {
    let fileBuffer: Buffer
    try {
      fileBuffer = await handleUploadExcel(req)
    } catch (uploadError) {
      const errorMessage =
        uploadError instanceof Error ? uploadError.message : 'Unknown error'
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Lỗi khi upload file Excel',
        error: errorMessage,
        ...(uploadError instanceof Error && { errorName: uploadError.name })
      })
    }

    let ssLists: SSList[]
    try {
      ssLists = await excelService.importSSList(fileBuffer)
    } catch (parseError) {
      const errorMessage =
        parseError instanceof Error ? parseError.message : 'Unknown error'
      const errorStack =
        parseError instanceof Error ? parseError.stack : undefined
      const isDevelopment = process.env.NODE_ENV !== 'production'

      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Lỗi khi đọc file Excel',
        error: errorMessage,
        ...(isDevelopment && errorStack && { stack: errorStack }),
        ...(parseError instanceof Error && { errorName: parseError.name })
      })
    }

    if (ssLists.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'File Excel không chứa dữ liệu hợp lệ',
        error:
          'File Excel không có dữ liệu hoặc không đúng định dạng. Vui lòng kiểm tra lại file và đảm bảo có sheet "Template" với dữ liệu hợp lệ.'
      })
    }

    const results = {
      success: [] as SSList[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const ssList of ssLists) {
      try {
        const topic = await databaseService.topics.findOne({
          _id: ssList.topic
        })
        const level = await databaseService.levels.findOne({
          _id: ssList.level
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${ssList.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${ssList.level}`)
        }

        if (!ssList.slug) {
          ssList.slug = createSlug(ssList.title)
        }

        const existing = await databaseService.ssLists.findOne({
          slug: ssList.slug
        })
        if (existing) {
          ssList.slug = `${createSlug(ssList.title)}-${Date.now()}`
        }

        const ssListWithInfo = {
          ...ssList,
          topic: {
            _id: topic._id?.toString(),
            title: topic.title
          },
          level: {
            _id: level._id?.toString(),
            title: level.title
          }
        } as any

        results.success.push(ssListWithInfo as SSList)
      } catch (error) {
        results.failed.push({
          title: ssList.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Đã parse thành công ${results.success.length} danh sách, thất bại ${results.failed.length} danh sách`,
      data: {
        success: results.success.length,
        failed: results.failed.length,
        details: results
      }
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const isDevelopment = process.env.NODE_ENV !== 'production'

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Không thể import file Excel',
      error: errorMessage,
      ...(isDevelopment && errorStack && { stack: errorStack }),
      ...(error instanceof Error && { errorName: error.name })
    })
  }
}

// POST /admin/speaking-sentence/import/save
export const saveImportedSSListController = async (
  req: Request,
  res: Response
) => {
  try {
    const { ssLists } = req.body

    if (!Array.isArray(ssLists) || ssLists.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Không có dữ liệu để lưu'
      })
    }

    const results = {
      success: [] as SSList[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const ssListData of ssLists) {
      try {
        const ssList = new SSList({
          title: ssListData.title,
          topic: new ObjectId(ssListData.topic?._id || ssListData.topic),
          level: new ObjectId(ssListData.level?._id || ssListData.level),
          list: ssListData.list || [],
          slug: ssListData.slug,
          pos: ssListData.pos || 1,
          isActive:
            ssListData.isActive !== undefined ? ssListData.isActive : true
        })

        const topic = await databaseService.topics.findOne({
          _id: ssList.topic
        })
        const level = await databaseService.levels.findOne({
          _id: ssList.level
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${ssList.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${ssList.level}`)
        }

        const existing = await databaseService.ssLists.findOne({
          slug: ssList.slug
        })
        if (existing) {
          ssList.slug = `${createSlug(ssList.title)}-${Date.now()}`
        }

        await speakingServices.createSSList(ssList)
        results.success.push(ssList)
      } catch (error) {
        results.failed.push({
          title: ssListData.title || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Đã lưu thành công ${results.success.length} danh sách, thất bại ${results.failed.length} danh sách`,
      data: {
        success: results.success.length,
        failed: results.failed.length,
        details: results
      }
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const isDevelopment = process.env.NODE_ENV !== 'production'

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Không thể lưu dữ liệu import',
      error: errorMessage,
      ...(isDevelopment && errorStack && { stack: errorStack }),
      ...(error instanceof Error && { errorName: error.name })
    })
  }
}
