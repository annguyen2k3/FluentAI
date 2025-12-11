import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import SVShadowing from '~/models/schemas/sv-shadowing.schema'
import categoriesServices from '~/services/categories.service'
import speakingServices from '~/services/speaking.service'
import { databaseService } from '~/services/database.service'

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
