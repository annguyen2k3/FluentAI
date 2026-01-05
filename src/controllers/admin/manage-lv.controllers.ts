import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import ListeningVideo from '~/models/schemas/lv-video.schemas'
import categoriesServices from '~/services/categories.service'
import listeningService from '~/services/listening.service'
import { databaseService } from '~/services/database.service'
import excelService from '~/services/excel.service'
import { handleUploadExcel } from '~/utils/file'
import { createSlug, normalizeYouTubeUrl } from '~/utils/format'

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderManageLvController = async (req: Request, res: Response) => {
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

  res.render('admin/pages/manage-lv.pug', {
    pageTitle: 'Admin - Quản lý luyện nghe video',
    admin,
    topics,
    levels,
    prefixAdmin
  })
}

export const getListLvController = async (req: Request, res: Response) => {
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

  const data = await listeningService.getLVListForAdmin({
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
    message: 'Danh sách bài nghe video đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

export const createLVListController = async (req: Request, res: Response) => {
  const {
    title,
    level,
    topics,
    videoUrl,
    thumbnailUrl,
    transcript,
    questions,
    time,
    description,
    pos,
    slug,
    isActive
  } = req.body

  const topicsArray = Array.isArray(topics)
    ? topics.map((t: string) => new ObjectId(t))
    : [new ObjectId(topics)]

  const questionsWithId = (questions || []).map((q: any) => ({
    ...q,
    _id: q._id ? new ObjectId(q._id) : new ObjectId()
  }))

  const listeningVideo = new ListeningVideo({
    title,
    level: new ObjectId(level),
    topics: topicsArray,
    videoUrl,
    thumbnailUrl,
    transcript: transcript || [],
    questions: questionsWithId,
    time: time ? Number(time) : undefined,
    description,
    pos: Number(pos),
    slug,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  })
  await listeningService.createLV(listeningVideo)
  res.status(HttpStatus.CREATED).json({
    message: 'Bài nghe video đã được tạo thành công',
    status: HttpStatus.CREATED,
    listeningVideo
  })
}

export const updateLVListController = async (req: Request, res: Response) => {
  const {
    id,
    title,
    level,
    topics,
    videoUrl,
    thumbnailUrl,
    transcript,
    questions,
    time,
    description,
    pos,
    slug,
    isActive
  } = req.body
  const existingLV = await databaseService.listeningVideos.findOne({
    _id: new ObjectId(id)
  })
  if (!existingLV) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Bài nghe video không tồn tại'
    })
    return
  }

  const topicsArray = Array.isArray(topics)
    ? topics.map((t: string) => new ObjectId(t))
    : [new ObjectId(topics)]

  const questionsWithId = (questions || []).map((q: any) => ({
    ...q,
    _id: q._id ? new ObjectId(q._id) : new ObjectId()
  }))

  const listeningVideo = new ListeningVideo({
    _id: new ObjectId(id),
    title,
    level: new ObjectId(level),
    topics: topicsArray,
    videoUrl,
    thumbnailUrl,
    transcript: transcript || [],
    questions: questionsWithId,
    time: time ? Number(time) : undefined,
    description,
    pos: Number(pos),
    slug,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    create_at: existingLV.create_at,
    update_at: new Date()
  })
  await listeningService.updateLV(listeningVideo)
  res.status(HttpStatus.OK).json({
    message: 'Bài nghe video đã được cập nhật thành công',
    status: HttpStatus.OK,
    listeningVideo
  })
}

export const deleteLVListController = async (req: Request, res: Response) => {
  const { id } = req.body
  const lv = await databaseService.listeningVideos.findOne({
    _id: new ObjectId(id)
  })
  if (!lv) {
    res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: 'Bài nghe video không tồn tại'
    })
    return
  }
  await databaseService.listeningVideos.deleteOne({ _id: new ObjectId(id) })
  res.status(HttpStatus.OK).json({
    message: 'Bài nghe video đã được xóa thành công',
    status: HttpStatus.OK
  })
}

export const renderImportLvController = async (req: Request, res: Response) => {
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
  res.render('admin/pages/import-excel/import-lv.pug', {
    pageTitle: 'Admin - Import luyện nghe video',
    admin,
    prefixAdmin,
    topics,
    levels
  })
}

export const downloadLVTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const buffer = await excelService.createLVTemplate()
    const filename = `lv-list-template-${Date.now()}.xlsx`

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

export const importLVListController = async (req: Request, res: Response) => {
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

    let listeningVideos: ListeningVideo[]
    try {
      listeningVideos = await excelService.importLVList(fileBuffer)
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

    if (listeningVideos.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'File Excel không chứa dữ liệu hợp lệ',
        error:
          'File Excel không có dữ liệu hoặc không đúng định dạng. Vui lòng kiểm tra lại file và đảm bảo có các sheet với dữ liệu hợp lệ.'
      })
    }

    const results = {
      success: [] as ListeningVideo[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const listeningVideo of listeningVideos) {
      try {
        const level = await databaseService.levels.findOne({
          _id: listeningVideo.level
        })

        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${listeningVideo.level}`)
        }

        for (const topicId of listeningVideo.topics) {
          const topic = await databaseService.topics.findOne({
            _id: topicId
          })
          if (!topic) {
            throw new Error(`Chủ đề không tồn tại: ${topicId}`)
          }
        }

        if (!listeningVideo.slug) {
          listeningVideo.slug = createSlug(listeningVideo.title)
        }

        const existing = await databaseService.listeningVideos.findOne({
          slug: listeningVideo.slug
        })
        if (existing) {
          listeningVideo.slug = `${createSlug(listeningVideo.title)}-${Date.now()}`
        }

        let videoUrlStr = ''
        if (listeningVideo.videoUrl) {
          if (typeof listeningVideo.videoUrl === 'string') {
            videoUrlStr = normalizeYouTubeUrl(listeningVideo.videoUrl.trim())
          } else {
            videoUrlStr = normalizeYouTubeUrl(String(listeningVideo.videoUrl).trim())
          }
        }
        
        let thumbnailUrlStr: string | undefined = undefined
        if (listeningVideo.thumbnailUrl) {
          if (typeof listeningVideo.thumbnailUrl === 'string') {
            thumbnailUrlStr = listeningVideo.thumbnailUrl.trim() || undefined
          } else {
            const thumbStr = String(listeningVideo.thumbnailUrl).trim()
            thumbnailUrlStr = thumbStr || undefined
          }
        }

        const topicsInfo = await Promise.all(
          listeningVideo.topics.map(async (topicId) => {
            const topic = await databaseService.topics.findOne({ _id: topicId })
            return {
              _id: topic?._id?.toString() || '',
              title: topic?.title || ''
            }
          })
        )

        const listeningVideoWithInfo = {
          _id: listeningVideo._id?.toString(),
          title: listeningVideo.title,
          videoUrl: videoUrlStr,
          thumbnailUrl: thumbnailUrlStr,
          transcript: listeningVideo.transcript || [],
          questions: listeningVideo.questions || [],
          time: listeningVideo.time,
          description: listeningVideo.description,
          slug: listeningVideo.slug,
          pos: listeningVideo.pos || 1,
          isActive: listeningVideo.isActive !== undefined ? listeningVideo.isActive : true,
          level: {
            _id: level._id?.toString(),
            title: level.title
          },
          topics: topicsInfo
        } as any

        results.success.push(listeningVideoWithInfo as ListeningVideo)
      } catch (error) {
        results.failed.push({
          title: listeningVideo.title,
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

export const saveImportedLVListController = async (
  req: Request,
  res: Response
) => {
  try {
    const { lvVideos } = req.body

    if (!Array.isArray(lvVideos) || lvVideos.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Không có dữ liệu để lưu'
      })
    }

    const results = {
      success: [] as ListeningVideo[],
      failed: [] as Array<{ title: string; error: string }>
    }

    for (const lvVideoData of lvVideos) {
      try {
        let videoUrl = lvVideoData.videoUrl
        if (videoUrl && typeof videoUrl === 'string') {
          videoUrl = normalizeYouTubeUrl(videoUrl.trim())
        } else if (videoUrl) {
          videoUrl = normalizeYouTubeUrl(String(videoUrl).trim())
        }
        
        if (!videoUrl) {
          throw new Error('Video URL không hợp lệ')
        }

        const topicsArray = Array.isArray(lvVideoData.topics)
          ? lvVideoData.topics.map((t: any) => new ObjectId(t._id || t))
          : []

        const questionsWithId = (lvVideoData.questions || []).map((q: any) => ({
          ...q,
          _id: q._id ? new ObjectId(q._id) : new ObjectId()
        }))

        const listeningVideo = new ListeningVideo({
          title: lvVideoData.title,
          level: new ObjectId(lvVideoData.level?._id || lvVideoData.level),
          topics: topicsArray,
          videoUrl: videoUrl,
          thumbnailUrl: lvVideoData.thumbnailUrl,
          transcript: lvVideoData.transcript || [],
          questions: questionsWithId,
          time: lvVideoData.time,
          description: lvVideoData.description,
          slug: lvVideoData.slug,
          pos: lvVideoData.pos || 1,
          isActive:
            lvVideoData.isActive !== undefined
              ? lvVideoData.isActive
              : true
        })

        const level = await databaseService.levels.findOne({
          _id: listeningVideo.level
        })

        if (!level) {
          throw new Error(`Cấp độ không tồn tại: ${listeningVideo.level}`)
        }

        for (const topicId of listeningVideo.topics) {
          const topic = await databaseService.topics.findOne({
            _id: topicId
          })
          if (!topic) {
            throw new Error(`Chủ đề không tồn tại: ${topicId}`)
          }
        }

        const existing = await databaseService.listeningVideos.findOne({
          slug: listeningVideo.slug
        })
        if (existing) {
          listeningVideo.slug = `${createSlug(listeningVideo.title)}-${Date.now()}`
        }

        await listeningService.createLV(listeningVideo)
        results.success.push(listeningVideo)
      } catch (error) {
        results.failed.push({
          title: lvVideoData.title || 'Unknown',
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
