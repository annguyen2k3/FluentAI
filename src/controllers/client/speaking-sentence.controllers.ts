import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import speakingServices from '~/services/speaking.services'

// GET /speaking-sentence/
export const renderSSListController = async (req: Request, res: Response) => {
  const user = req.user as User

  const levels = await databaseService.levels
    .find({})
    .sort({ pos: 1 })
    .toArray()

  const topics = await databaseService.topics
    .find({})
    .sort({ pos: 1 })
    .toArray()

  res.render('client/pages/speaking-sentence/list.pug', {
    pageTitle: 'Luyện phát âm - Danh sách',
    user: user,
    levels,
    topics
  })
}

// GET /speaking-sentence/list
export const getSSListController = async (req: Request, res: Response) => {
  const find: {
    level?: ObjectId
    topic?: ObjectId
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
  } = {}

  if (req.query.level) {
    find.level = new ObjectId(req.query.level as string)
  }
  if (req.query.topic) {
    find.topic = new ObjectId(req.query.topic as string)
  }
  if (req.query.page) {
    find.page = parseInt(req.query.page as string)
  }
  if (req.query.limit) {
    find.limit = parseInt(req.query.limit as string)
  }
  if (req.query.search) {
    find.search = req.query.search as string
  }
  if (req.query.sortKey) {
    find.sortKey = req.query.sortKey as string
  }
  if (req.query.sortOrder) {
    find.sortOrder = req.query.sortOrder as 'asc' | 'desc'
  }

  const data = await speakingServices.getSSList(find)

  console.log('data', data)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách câu phát âm đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}
