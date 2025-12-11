import { Request, Response } from 'express'
import { Admin, ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { PartOfSpeech } from '~/constants/enum'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import categoriesServices from '~/services/categories.service'
import writingService from '~/services/writing.service'
import { databaseService } from '~/services/database.service'

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
