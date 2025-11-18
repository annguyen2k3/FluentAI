import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { PartOfSpeech } from '~/constants/enum'
import WSList from '~/models/schemas/ws-list.schema'
import categoriesServices from '~/services/categories.services'
import writingService from '~/services/writing.service'

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

  const level =
    levelParam && ObjectId.isValid(levelParam)
      ? new ObjectId(levelParam)
      : undefined
  const topic =
    topicParam && ObjectId.isValid(topicParam)
      ? new ObjectId(topicParam)
      : undefined

  const data = await writingService.getWSList({ page, limit, level, topic })
  res.status(HttpStatus.OK).json({
    message: 'Danh sách bài học đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

// POST /admin/ws/create
export const createWSListController = async (req: Request, res: Response) => {
  const { title, topic, level, list, pos, slug } = req.body
  const wsList = new WSList({
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    list,
    pos,
    slug
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
  const { id, title, topic, level, list, pos, slug } = req.body
  const wsList = new WSList({
    _id: new ObjectId(id),
    title,
    topic: new ObjectId(topic),
    level: new ObjectId(level),
    list,
    pos,
    slug,
    update_at: new Date()
  })
  await writingService.updateWSList(wsList)
  res.status(HttpStatus.OK).json({
    message: 'Bài học đã được cập nhật thành công',
    status: HttpStatus.OK,
    wsList
  })
}
