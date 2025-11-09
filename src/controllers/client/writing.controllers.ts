import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import writingService from '~/services/writing.service'


// GET /writing-sentence/setup
export const getSetupWritingSentenceController = async (req: Request, res: Response) => {
  const user = req.user as User

  const levels = await databaseService.levels.find({}).toArray()

  res.render('client/pages/writing-sentence/setup.pug', { 
    pageTitle: 'Chọn mức độ và chủ đề', 
    user: user, 
    levels: levels 
})
}

// GET /writing-sentence/system-list
export const getSystemListWSController = async (req: Request, res: Response) => {
  const user = req.user as User

  const level = await databaseService.levels.findOne({ slug: req.query.level as string })
  if (!level) {
    return res.redirect('/writing-sentence/setup')
  }
  const topics = await databaseService.topics.find({}).toArray()

  res.render('client/pages/writing-sentence/list.pug', {
    pageTitle: 'Chọn danh sách', 
    user,
    topics,
    level
  })
}

export const getWSListController = async (req: Request, res: Response) => {
  const user = req.user as User
  const find: { level?: ObjectId, topic?: ObjectId, page?: number, limit?: number } = {}

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

  console.log('find', find)

  const data = await writingService.getWSList(find)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách bài học đã lấy thành công',
    status: HttpStatus.OK,
    user: user,
    ...data
  })
}