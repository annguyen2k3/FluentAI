import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import SSList from '~/models/schemas/ss-list.schema'
import categoriesServices from '~/services/categories.service'
import speakingServices from '~/services/speaking.service'
import { databaseService } from '~/services/database.service'

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
