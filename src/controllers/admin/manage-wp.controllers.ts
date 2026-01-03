import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { PartOfSpeech } from '~/constants/enum'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import categoriesServices from '~/services/categories.service'
import writingService from '~/services/writing.service'
import { databaseService } from '~/services/database.service'
import excelService from '~/services/excel.service'
import { handleUploadExcel } from '~/utils/file'
import { createSlug } from '~/utils/format'

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderManageWpController = async (req: Request, res: Response) => {
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
  const types = (await categoriesServices.getTypes()).map((type) => ({
    _id: type._id?.toString() || '',
    title: type.title,
    slug: type.slug,
    pos: type.pos
  }))
  const partOfSpeechOptions = Object.values(PartOfSpeech)

  res.render('admin/pages/manage-wp.pug', {
    pageTitle: 'Admin - Quản lý luyện viết đoạn văn',
    admin,
    topics,
    levels,
    types,
    prefixAdmin,
    partOfSpeechOptions
  })
}

export const getListWpController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const levelParam = req.query.level as string | undefined
  const topicParam = req.query.topic as string | undefined
  const typeParam = req.query.type as string | undefined
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
  const type =
    typeParam && ObjectId.isValid(typeParam)
      ? new ObjectId(typeParam)
      : undefined
  const isActive =
    isActiveParam !== undefined && isActiveParam !== ''
      ? isActiveParam === 'true'
      : undefined

  const data = await writingService.getWPList({
    page,
    limit,
    level,
    topic,
    type,
    isActive,
    search,
    sortKey,
    sortOrder
  })
  res.status(HttpStatus.OK).json({
    message: 'Danh sách nội dung viết đoạn văn đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

export const createWPListController = async (req: Request, res: Response) => {
  const { title, topic, level, type, content, hint, pos, slug, isActive } =
    req.body
  const wpParagraph = new WPParagraph({
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    type: new ObjectId(type),
    content,
    hint: hint || [],
    pos: Number(pos),
    slug,
    isActive:
      isActive !== undefined ? isActive === true || isActive === 'true' : true
  })
  await writingService.createWPParagraph(wpParagraph)
  res.status(HttpStatus.CREATED).json({
    message: 'Nội dung viết đoạn văn đã được tạo thành công',
    status: HttpStatus.CREATED,
    wpParagraph
  })
}

export const updateWPListController = async (req: Request, res: Response) => {
  const { id, title, topic, level, type, content, hint, pos, slug, isActive } =
    req.body
  const wpParagraph = new WPParagraph({
    _id: new ObjectId(id),
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    type: new ObjectId(type),
    content,
    hint: hint || [],
    pos: Number(pos),
    slug,
    isActive:
      isActive !== undefined ? isActive === true || isActive === 'true' : true,
    update_at: new Date()
  })
  await writingService.updateWPParagraph(wpParagraph)
  res.status(HttpStatus.OK).json({
    message: 'Nội dung viết đoạn văn đã được cập nhật thành công',
    status: HttpStatus.OK,
    wpParagraph
  })
}

export const deleteWPListController = async (req: Request, res: Response) => {
  const { id } = req.body
  const wpParagraph = await databaseService.wpParagraphs.findOne({
    _id: new ObjectId(id)
  })
  if (!wpParagraph) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Nội dung viết đoạn văn không tồn tại'
    })
    return
  }
  await databaseService.wpParagraphs.deleteOne({ _id: new ObjectId(id) })
  res.status(HttpStatus.OK).json({
    message: 'Nội dung viết đoạn văn đã được xóa thành công',
    status: HttpStatus.OK
  })
}

export const renderImportWpController = async (req: Request, res: Response) => {
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
  const types = (await categoriesServices.getTypes()).map((type) => ({
    _id: type._id?.toString() || '',
    title: type.title,
    slug: type.slug,
    pos: type.pos
  }))
  res.render('admin/pages/import-excel/import-wp.pug', {
    pageTitle: 'Admin - Import luyện viết đoạn văn',
    admin,
    prefixAdmin,
    topics,
    levels,
    types
  })
}

export const downloadWPTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const buffer = await excelService.createWPTemplate()
    const filename = `wp-list-template-${Date.now()}.xlsx`

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

export const importWPListController = async (req: Request, res: Response) => {
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

    let wpParagraphs: WPParagraph[]
    try {
      wpParagraphs = await excelService.importWPList(fileBuffer)
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

    if (wpParagraphs.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'File Excel không chứa dữ liệu hợp lệ',
        error:
          'File Excel không có dữ liệu hoặc không đúng định dạng. Vui lòng kiểm tra lại file và đảm bảo có các sheet với dữ liệu hợp lệ.'
      })
    }

    const results = {
      success: [] as WPParagraph[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const wpParagraph of wpParagraphs) {
      try {
        const topic = await databaseService.topics.findOne({
          _id: wpParagraph.topic
        })
        const level = await databaseService.levels.findOne({
          _id: wpParagraph.level
        })
        const type = await databaseService.types.findOne({
          _id: wpParagraph.type
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${wpParagraph.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${wpParagraph.level}`)
        }
        if (!type) {
          throw new Error(`Loại không tồn tại: ${wpParagraph.type}`)
        }

        if (!wpParagraph.slug) {
          wpParagraph.slug = createSlug(wpParagraph.title)
        }

        const existing = await databaseService.wpParagraphs.findOne({
          slug: wpParagraph.slug
        })
        if (existing) {
          wpParagraph.slug = `${createSlug(wpParagraph.title)}-${Date.now()}`
        }

        const wpParagraphWithInfo = {
          ...wpParagraph,
          topic: {
            _id: topic._id?.toString(),
            title: topic.title
          },
          level: {
            _id: level._id?.toString(),
            title: level.title
          },
          type: {
            _id: type._id?.toString(),
            title: type.title
          }
        } as any

        results.success.push(wpParagraphWithInfo as WPParagraph)
      } catch (error) {
        results.failed.push({
          title: wpParagraph.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Đã parse thành công ${results.success.length} đoạn văn, thất bại ${results.failed.length} đoạn văn`,
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

export const saveImportedWPListController = async (
  req: Request,
  res: Response
) => {
  try {
    const { wpParagraphs } = req.body

    if (!Array.isArray(wpParagraphs) || wpParagraphs.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Không có dữ liệu để lưu'
      })
    }

    const results = {
      success: [] as WPParagraph[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const wpParagraphData of wpParagraphs) {
      try {
        const wpParagraph = new WPParagraph({
          title: wpParagraphData.title,
          topic: new ObjectId(
            wpParagraphData.topic?._id || wpParagraphData.topic
          ),
          level: new ObjectId(
            wpParagraphData.level?._id || wpParagraphData.level
          ),
          type: new ObjectId(wpParagraphData.type?._id || wpParagraphData.type),
          content: wpParagraphData.content,
          hint: wpParagraphData.hint || [],
          slug: wpParagraphData.slug,
          pos: wpParagraphData.pos || 1,
          isActive:
            wpParagraphData.isActive !== undefined
              ? wpParagraphData.isActive
              : true
        })

        const topic = await databaseService.topics.findOne({
          _id: wpParagraph.topic
        })
        const level = await databaseService.levels.findOne({
          _id: wpParagraph.level
        })
        const type = await databaseService.types.findOne({
          _id: wpParagraph.type
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${wpParagraph.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${wpParagraph.level}`)
        }
        if (!type) {
          throw new Error(`Loại không tồn tại: ${wpParagraph.type}`)
        }

        const existing = await databaseService.wpParagraphs.findOne({
          slug: wpParagraph.slug
        })
        if (existing) {
          wpParagraph.slug = `${createSlug(wpParagraph.title)}-${Date.now()}`
        }

        await writingService.createWPParagraph(wpParagraph)
        results.success.push(wpParagraph)
      } catch (error) {
        results.failed.push({
          title: wpParagraphData.title || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Đã lưu thành công ${results.success.length} đoạn văn, thất bại ${results.failed.length} đoạn văn`,
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
