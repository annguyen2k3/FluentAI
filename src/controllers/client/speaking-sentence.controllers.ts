import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { StatusLesson } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import speakingServices from '~/services/speaking.services'
import textToSpeech from '~/utils/text-to-speech'

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

  res.status(HttpStatus.OK).json({
    message: 'Danh sách câu phát âm đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

// GET /speaking-sentence/practice/:slug
export const renderSSPracticeController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug as string
  const ss = await databaseService.ssLists.findOne({ slug: slug })
  if (!ss) {
    return res.redirect('/speaking-sentence')
  }

  const hisSS = await databaseService.hisSSUsers.findOne({
    user: user._id,
    ss: ss._id,
    status: StatusLesson.IN_PROGRESS
  })

  res.render('client/pages/speaking-sentence/practice.pug', {
    pageTitle: 'Luyện tập câu phát âm',
    user,
    ss,
    hisSS
  })
}

// POST /speaking-sentence/practice/audio
export const generateSSAudioController = async (
  req: Request,
  res: Response
) => {
  const text = typeof req.body.text === 'string' ? req.body.text.trim() : ''
  if (!text) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Text is required',
      status: HttpStatus.BAD_REQUEST
    })
  }
  try {
    const result = await textToSpeech(text)
    if (!result.success || !result.audio) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate audio',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }

    const audioBase64 = result.audio.toString('base64')

    return res.status(HttpStatus.OK).json({
      message: 'Audio generated successfully',
      status: HttpStatus.OK,
      audio: audioBase64,
      contentType: 'audio/mpeg'
    })
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to generate audio',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}
