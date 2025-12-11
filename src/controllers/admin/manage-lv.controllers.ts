import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import ListeningVideo from '~/models/schemas/lv-video.schemas'
import categoriesServices from '~/services/categories.service'
import listeningService from '~/services/listening.service'
import { databaseService } from '~/services/database.service'

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
