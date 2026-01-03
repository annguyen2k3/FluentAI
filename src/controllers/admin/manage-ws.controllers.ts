import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { PartOfSpeech } from '~/constants/enum'
import WSList from '~/models/schemas/ws-list.schema'
import categoriesServices from '~/services/categories.service'
import writingService from '~/services/writing.service'
import { databaseService } from '~/services/database.service'
import excelService from '~/services/excel.service'
import { handleUploadExcel } from '~/utils/file'
import { createSlug } from '~/utils/format'

const prefixAdmin = process.env.PREFIX_ADMIN

// GET /admin/ws
export const renderManageWsController = async (req: Request, res: Response) => {
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
  const partOfSpeechOptions = Object.values(PartOfSpeech)

  res.render('admin/pages/manage-ws.pug', {
    pageTitle: 'Admin - Quản lý luyện viết câu',
    admin,
    topics,
    levels,
    prefixAdmin,
    partOfSpeechOptions
  })
}

// GET /admin/ws/list
export const getListWsController = async (req: Request, res: Response) => {
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

  const data = await writingService.getWSList({
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
    message: 'Danh sách bài học đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

// POST /admin/ws/create
export const createWSListController = async (req: Request, res: Response) => {
  const { title, topic, level, list, pos, slug, isActive } = req.body
  const wsList = new WSList({
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    list,
    pos: Number(pos),
    slug,
    isActive:
      isActive !== undefined ? isActive === true || isActive === 'true' : true
  })
  await writingService.createWSList(wsList)
  res.status(HttpStatus.CREATED).json({
    message: 'Bài học đã được tạo thành công',
    status: HttpStatus.CREATED,
    wsList
  })
}

// PUT /admin/ws/update
export const updateWSListController = async (req: Request, res: Response) => {
  const { id, title, topic, level, list, pos, slug, isActive } = req.body
  const wsList = new WSList({
    _id: new ObjectId(id),
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    list,
    pos: Number(pos),
    slug,
    isActive:
      isActive !== undefined ? isActive === true || isActive === 'true' : true,
    update_at: new Date()
  })
  await writingService.updateWSList(wsList)
  res.status(HttpStatus.OK).json({
    message: 'Bài học đã được cập nhật thành công',
    status: HttpStatus.OK,
    wsList
  })
}

// DELETE /admin/ws/delete
export const deleteWSListController = async (req: Request, res: Response) => {
  const { id } = req.body
  const wsList = await databaseService.wsLists.findOne({
    _id: new ObjectId(id)
  })
  if (!wsList) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Bài học không tồn tại'
    })
    return
  }
  await databaseService.wsLists.deleteOne({ _id: new ObjectId(id) })
  res.status(HttpStatus.OK).json({
    message: 'Bài học đã được xóa thành công',
    status: HttpStatus.OK
  })
}

// GET /admin/ws/import
export const renderImportWsController = async (req: Request, res: Response) => {
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
  res.render('admin/pages/import-excel/import-ws.pug', {
    pageTitle: 'Admin - Import luyện viết câu',
    admin,
    prefixAdmin,
    topics,
    levels
  })
}

// GET /admin/ws/export-template
export const downloadWSTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const buffer = await excelService.createWSTemplate()
    const filename = `ws-list-template-${Date.now()}.xlsx`

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

// POST /admin/ws/import
export const importWSListController = async (req: Request, res: Response) => {
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

    let wsLists: WSList[]
    try {
      wsLists = await excelService.importWSList(fileBuffer)
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

    if (wsLists.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'File Excel không chứa dữ liệu hợp lệ',
        error:
          'File Excel không có dữ liệu hoặc không đúng định dạng. Vui lòng kiểm tra lại file và đảm bảo có sheet "Template" với dữ liệu hợp lệ.'
      })
    }

    // Validate và chuẩn bị dữ liệu (không lưu vào DB)
    const results = {
      success: [] as WSList[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const wsList of wsLists) {
      try {
        // Validate topic và level tồn tại
        const topic = await databaseService.topics.findOne({
          _id: wsList.topic
        })
        const level = await databaseService.levels.findOne({
          _id: wsList.level
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${wsList.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${wsList.level}`)
        }

        // Tạo slug nếu chưa có
        if (!wsList.slug) {
          wsList.slug = createSlug(wsList.title)
        }

        // Kiểm tra slug trùng lặp (chỉ kiểm tra, không tạo mới)
        const existing = await databaseService.wsLists.findOne({
          slug: wsList.slug
        })
        if (existing) {
          wsList.slug = `${createSlug(wsList.title)}-${Date.now()}`
        }

        // Thêm thông tin topic và level vào object để hiển thị
        const wsListWithInfo = {
          ...wsList,
          topic: {
            _id: topic._id?.toString(),
            title: topic.title
          },
          level: {
            _id: level._id?.toString(),
            title: level.title
          }
        } as any

        results.success.push(wsListWithInfo as WSList)
      } catch (error) {
        results.failed.push({
          title: wsList.title,
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

// POST /admin/ws/import/save
// Description: Lưu dữ liệu đã import vào hệ thống
export const saveImportedWSListController = async (
  req: Request,
  res: Response
) => {
  try {
    const { wsLists } = req.body

    if (!Array.isArray(wsLists) || wsLists.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Không có dữ liệu để lưu'
      })
    }

    const results = {
      success: [] as WSList[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const wsListData of wsLists) {
      try {
        const wsList = new WSList({
          title: wsListData.title,
          topic: new ObjectId(wsListData.topic?._id || wsListData.topic),
          level: new ObjectId(wsListData.level?._id || wsListData.level),
          list: wsListData.list || [],
          slug: wsListData.slug,
          pos: wsListData.pos || 1,
          isActive:
            wsListData.isActive !== undefined ? wsListData.isActive : true
        })

        // Validate topic và level tồn tại
        const topic = await databaseService.topics.findOne({
          _id: wsList.topic
        })
        const level = await databaseService.levels.findOne({
          _id: wsList.level
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${wsList.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${wsList.level}`)
        }

        // Kiểm tra slug trùng lặp
        const existing = await databaseService.wsLists.findOne({
          slug: wsList.slug
        })
        if (existing) {
          wsList.slug = `${createSlug(wsList.title)}-${Date.now()}`
        }

        // Tạo WSList
        await writingService.createWSList(wsList)
        results.success.push(wsList)
      } catch (error) {
        results.failed.push({
          title: wsListData.title || 'Unknown',
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
