import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import listeningService from '~/services/listening.service'

// GET /listening-video
export const renderListeningVideoController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const levels = await databaseService.levels.find({}).toArray()
  const lvTopicIds = await databaseService.listeningVideos.distinct('topics')
  const topics = await databaseService.topics
    .find({ _id: { $in: lvTopicIds } })
    .toArray()
  res.render('client/pages/listening-video/list.pug', {
    pageTitle: 'Luyện nghe video',
    user,
    levels,
    topics
  })
}

// GET /listening-video/list
export const getLVListController = async (req: Request, res: Response) => {
  const user = req.user as User
  const find: {
    level?: ObjectId
    topic?: ObjectId
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    status?: StatusLesson
    isActive?: boolean
    history?: {
      userId: ObjectId
      status?: StatusLesson
    }
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
  if (req.query.status) {
    find.history = {
      userId: user._id as ObjectId,
      status: req.query.status as StatusLesson
    }
  } else {
    find.history = {
      userId: user._id as ObjectId
    }
  }
  find.isActive = true

  const data = await listeningService.getLVList(find)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách video nghe đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

// GET /listening-video/comprehensible-input/:slug
export const renderLVCIController = async (req: Request, res: Response) => {
  const user = req.user as User
  const slug = req.params.slug

  try {
    const lv = await listeningService.getLVDetail(slug)

    await listeningService.updateHistory(
      user._id as ObjectId,
      lv._id as ObjectId,
      StatusLesson.IN_PROGRESS
    )

    res.render('client/pages/listening-video/practice-ci.pug', {
      pageTitle: 'Luyện nghe video - Comprehensible Input',
      user,
      lv
    })
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message:
        error instanceof Error ? error.message : 'Video nghe không tồn tại',
      status: HttpStatus.NOT_FOUND
    })
  }
}
