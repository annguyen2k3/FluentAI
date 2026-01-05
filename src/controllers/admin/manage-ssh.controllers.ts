import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import SVShadowing from '~/models/schemas/sv-shadowing.schema'
import categoriesServices from '~/services/categories.service'
import speakingServices from '~/services/speaking.service'
import { databaseService } from '~/services/database.service'
import excelService from '~/services/excel.service'
import { handleUploadExcel } from '~/utils/file'
import { createSlug, normalizeYouTubeUrl } from '~/utils/format'

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderManageSshController = async (
  req: Request,
  res: Response
) => {
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

  res.render('admin/pages/manage-ssh.pug', {
    pageTitle: 'Admin - Quản lý luyện phát âm Shadowing',
    admin,
    topics,
    levels,
    prefixAdmin
  })
}

export const getListSvController = async (req: Request, res: Response) => {
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

  const data = await speakingServices.getSVList({
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
    message: 'Danh sách bài nghe Shadowing đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

export const createSVListController = async (req: Request, res: Response) => {
  const {
    title,
    topic,
    level,
    videoUrl,
    thumbnailUrl,
    transcript,
    pos,
    slug,
    isActive
  } = req.body
  const svShadowing = new SVShadowing({
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    videoUrl,
    thumbnailUrl,
    transcript,
    pos: Number(pos),
    slug,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  })
  await speakingServices.createSVShadowing(svShadowing)
  res.status(HttpStatus.CREATED).json({
    message: 'Bài nghe Shadowing đã được tạo thành công',
    status: HttpStatus.CREATED,
    svShadowing
  })
}

export const updateSVListController = async (req: Request, res: Response) => {
  const {
    id,
    title,
    topic,
    level,
    videoUrl,
    thumbnailUrl,
    transcript,
    pos,
    slug,
    isActive
  } = req.body
  const existingSVShadowing = await databaseService.svShadowings.findOne({
    _id: new ObjectId(id)
  })
  if (!existingSVShadowing) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Bài nghe Shadowing không tồn tại'
    })
    return
  }
  const svShadowing = new SVShadowing({
    _id: new ObjectId(id),
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    videoUrl,
    thumbnailUrl,
    transcript,
    pos: Number(pos),
    slug,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    create_at: existingSVShadowing.create_at,
    update_at: new Date()
  })
  await speakingServices.updateSVShadowing(svShadowing)
  res.status(HttpStatus.OK).json({
    message: 'Bài nghe Shadowing đã được cập nhật thành công',
    status: HttpStatus.OK,
    svShadowing
  })
}

export const deleteSVListController = async (req: Request, res: Response) => {
  const { id } = req.body
  const svShadowing = await databaseService.svShadowings.findOne({
    _id: new ObjectId(id)
  })
  if (!svShadowing) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Bài nghe Shadowing không tồn tại'
    })
    return
  }
  await databaseService.svShadowings.deleteOne({ _id: new ObjectId(id) })
  res.status(HttpStatus.OK).json({
    message: 'Bài nghe Shadowing đã được xóa thành công',
    status: HttpStatus.OK
  })
}

export const renderImportSshController = async (req: Request, res: Response) => {
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
  res.render('admin/pages/import-excel/import-ssh.pug', {
    pageTitle: 'Admin - Import luyện phát âm Shadowing',
    admin,
    prefixAdmin,
    topics,
    levels
  })
}

export const downloadSVTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const buffer = await excelService.createSVTemplate()
    const filename = `sv-list-template-${Date.now()}.xlsx`

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

export const importSVListController = async (req: Request, res: Response) => {
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

    let svShadowings: SVShadowing[]
    try {
      svShadowings = await excelService.importSVList(fileBuffer)
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

    if (svShadowings.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'File Excel không chứa dữ liệu hợp lệ',
        error:
          'File Excel không có dữ liệu hoặc không đúng định dạng. Vui lòng kiểm tra lại file và đảm bảo có các sheet với dữ liệu hợp lệ.'
      })
    }

    const results = {
      success: [] as SVShadowing[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const svShadowing of svShadowings) {
      try {
        const topic = await databaseService.topics.findOne({
          _id: svShadowing.topic
        })
        const level = await databaseService.levels.findOne({
          _id: svShadowing.level
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${svShadowing.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${svShadowing.level}`)
        }

        if (!svShadowing.slug) {
          svShadowing.slug = createSlug(svShadowing.title)
        }

        const existing = await databaseService.svShadowings.findOne({
          slug: svShadowing.slug
        })
        if (existing) {
          svShadowing.slug = `${createSlug(svShadowing.title)}-${Date.now()}`
        }

        let videoUrlStr = ''
        if (svShadowing.videoUrl) {
          if (typeof svShadowing.videoUrl === 'string') {
            videoUrlStr = normalizeYouTubeUrl(svShadowing.videoUrl.trim())
          } else {
            videoUrlStr = normalizeYouTubeUrl(String(svShadowing.videoUrl).trim())
          }
        }
        
        let thumbnailUrlStr: string | undefined = undefined
        if (svShadowing.thumbnailUrl) {
          if (typeof svShadowing.thumbnailUrl === 'string') {
            thumbnailUrlStr = svShadowing.thumbnailUrl.trim() || undefined
          } else {
            const thumbStr = String(svShadowing.thumbnailUrl).trim()
            thumbnailUrlStr = thumbStr || undefined
          }
        }

        const svShadowingWithInfo = {
          _id: svShadowing._id?.toString(),
          title: svShadowing.title,
          videoUrl: videoUrlStr,
          thumbnailUrl: thumbnailUrlStr,
          transcript: svShadowing.transcript || [],
          slug: svShadowing.slug,
          pos: svShadowing.pos || 1,
          isActive: svShadowing.isActive !== undefined ? svShadowing.isActive : true,
          topic: {
            _id: topic._id?.toString(),
            title: topic.title
          },
          level: {
            _id: level._id?.toString(),
            title: level.title
          }
        } as any

        results.success.push(svShadowingWithInfo as SVShadowing)
      } catch (error) {
        results.failed.push({
          title: svShadowing.title,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Đã parse thành công ${results.success.length} bài nghe, thất bại ${results.failed.length} bài nghe`,
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

export const saveImportedSVListController = async (
  req: Request,
  res: Response
) => {
  try {
    const { svShadowings } = req.body

    if (!Array.isArray(svShadowings) || svShadowings.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Không có dữ liệu để lưu'
      })
    }

    const results = {
      success: [] as SVShadowing[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const svShadowingData of svShadowings) {
      try {
        let videoUrl = svShadowingData.videoUrl
        if (videoUrl && typeof videoUrl === 'string') {
          videoUrl = normalizeYouTubeUrl(videoUrl.trim())
        } else if (videoUrl) {
          videoUrl = normalizeYouTubeUrl(String(videoUrl).trim())
        }
        
        if (!videoUrl) {
          throw new Error('Video URL không hợp lệ')
        }

        const svShadowing = new SVShadowing({
          title: svShadowingData.title,
          topic: new ObjectId(
            svShadowingData.topic?._id || svShadowingData.topic
          ),
          level: new ObjectId(
            svShadowingData.level?._id || svShadowingData.level
          ),
          videoUrl: videoUrl,
          thumbnailUrl: svShadowingData.thumbnailUrl,
          transcript: svShadowingData.transcript || [],
          slug: svShadowingData.slug,
          pos: svShadowingData.pos || 1,
          isActive:
            svShadowingData.isActive !== undefined
              ? svShadowingData.isActive
              : true
        })

        const topic = await databaseService.topics.findOne({
          _id: svShadowing.topic
        })
        const level = await databaseService.levels.findOne({
          _id: svShadowing.level
        })

        if (!topic) {
          throw new Error(`Chủ đề không tồn tại: ${svShadowing.topic}`)
        }
        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${svShadowing.level}`)
        }

        const existing = await databaseService.svShadowings.findOne({
          slug: svShadowing.slug
        })
        if (existing) {
          svShadowing.slug = `${createSlug(svShadowing.title)}-${Date.now()}`
        }

        await speakingServices.createSVShadowing(svShadowing)
        results.success.push(svShadowing)
      } catch (error) {
        results.failed.push({
          title: svShadowingData.title || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Đã lưu thành công ${results.success.length} bài nghe, thất bại ${results.failed.length} bài nghe`,
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
