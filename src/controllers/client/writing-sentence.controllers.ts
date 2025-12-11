import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { CreditUsageType, StatusLesson, UserScoreType } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import { WRITING_SENTENCE_MESSAGES } from '~/constants/message'
import User from '~/models/schemas/users.schema'
import WSList from '~/models/schemas/ws-list.schema'
import { databaseService } from '~/services/database.service'
import otherService from '~/services/other.service'
import scoreService from '~/services/score.service'
import writingService from '~/services/writing.service'

// GET /writing-sentence/setup
export const getSetupWritingSentenceController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User

  const levels = await databaseService.levels
    .find({})
    .sort({ pos: 1 })
    .toArray()

  res.render('client/pages/writing-sentence/setup.pug', {
    pageTitle: 'Chọn mức độ và chủ đề',
    user: user,
    levels: levels
  })
}

// GET /writing-sentence/system-list
export const getSystemListWSController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User

  const level = await databaseService.levels.findOne({
    slug: req.query.level as string
  })
  if (!level) {
    return res.redirect('/writing-sentence/setup')
  }
  const topicIds = await databaseService.wsLists.distinct('topic', {
    level: level._id
  })

  const topics = topicIds.length
    ? await databaseService.topics
        .find({
          _id: {
            $in: topicIds
          }
        })
        .sort({ pos: 1 })
        .toArray()
    : []

  res.render('client/pages/writing-sentence/list.pug', {
    pageTitle: 'Chọn danh sách',
    user,
    topics,
    level
  })
}

// GET /writing-sentence/list
export const getWSListController = async (req: Request, res: Response) => {
  const user = req.user as User
  const find: {
    level?: ObjectId
    topic?: ObjectId
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
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
  const data = await writingService.getWSList(find)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách bài học đã lấy thành công',
    status: HttpStatus.OK,
    user: user,
    ...data
  })
}

// GET /writing-sentence/practice/:slug
export const getPracticeWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const ws = req.ws as WSList

  const initResult = await writingService.wsInitChat(
    user._id?.toString() as string,
    ws._id?.toString() as string
  )
  if (!initResult.init_success) {
    return res.redirect('/writing-sentence/setup')
  }

  const hisWSUser = await writingService.getHisWSUser(
    user._id?.toString() as string,
    ws._id?.toString() as string
  )

  const userScore = await scoreService.getUserMonthlyScore(user._id as ObjectId)
  const scorePractice = await scoreService.getScoreForPracticeType(
    UserScoreType.WRITING_SENTENCE
  )

  const practiceCost = await otherService.getPracticeCost(
    CreditUsageType.writing_sentence_evaluate
  )

  res.render('client/pages/writing-sentence/practice.pug', {
    pageTitle: 'Luyện tập câu',
    user: user,
    ws,
    hisWSUser,
    scoreInfo: {
      totalScore: userScore.totalScore,
      scorePractice: scorePractice
    },
    practiceCost: practiceCost || 0
  })
}

// POST /writing-sentence/practice/:slug
export const postPracticeWSController = async (req: Request, res: Response) => {
  const user = req.user as any
  const ws = req.ws as WSList
  const { sentence_vi, user_translation } = req.body

  const practiceCostResult = await otherService.handlePracticeCost({
    wallet_id: user.wallet._id?.toString() as string,
    type: CreditUsageType.writing_sentence_evaluate
  })
  if (!practiceCostResult.success) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: practiceCostResult.message,
      status: HttpStatus.BAD_REQUEST
    })
  }

  const evaluateResult = await writingService.wsEvaluate(
    user._id?.toString() as string,
    ws._id?.toString() as string,
    sentence_vi,
    user_translation
  )

  if (evaluateResult.passed) {
    await writingService.updateHisWSUser(
      user._id?.toString() as string,
      ws._id?.toString() as string,
      evaluateResult
    )

    await scoreService.addScore(
      user._id as ObjectId,
      UserScoreType.WRITING_SENTENCE,
      ws._id as ObjectId,
      ws.title
    )
  }

  res.status(HttpStatus.OK).json({
    message: 'Đánh giá câu thành công',
    status: HttpStatus.OK,
    user: user,
    evaluateResult: evaluateResult
  })
}

// DELETE /writing-sentence/practice/:slug
export const deleteHistoryPracticeWSController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug as string

  const ws = await databaseService.wsLists.findOne({ slug: slug })
  if (!ws) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Không tìm thấy bài học',
      status: HttpStatus.NOT_FOUND
    })
  }
  await writingService.deleteHisWSUser(
    user._id?.toString() as string,
    ws._id?.toString() as string
  )
  return res.status(HttpStatus.OK).json({
    message: 'Xóa lịch sử luyện tập thành công',
    status: HttpStatus.OK
  })
}

// GET /writing-sentence/practice/complete/:slug
export const getCompleteWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const ws = req.ws as WSList
  try {
    const completeResult = await writingService.wsComplete(
      user._id!.toString(),
      ws._id!.toString()
    )
    return res.render('client/pages/writing-sentence/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeResult: completeResult
    })
  } catch (err) {
    console.log('Error:', err)
    res.redirect('/writing-sentence/setup')
    return
  }
}

// POST /writing-sentence/custom-topic/preview
export const postCustomTopicPreviewWSController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const { topic } = req.body

  const levelDes = req.level.description

  const previewResult = await writingService.wsPreviewCustomTopic(
    topic,
    levelDes
  )

  const wsListPreview = new WSList({
    title: 'Luyện tập chủ đề',
    topic: new ObjectId(),
    level: req.level._id,
    pos: 0,
    slug:
      (('paractice-custom-topic-' + user._id?.toString()) as string) +
      '-' +
      new Date().getTime(),
    create_at: new Date(),
    update_at: new Date(),
    list: previewResult.list
  })
  if (previewResult.passed) {
    await databaseService.wsListPreviews.insertOne(wsListPreview)
  }

  res.status(HttpStatus.OK).json({
    message: 'Xem trước chủ đề thành công',
    status: HttpStatus.OK,
    user: user,
    previewResult: previewResult,
    wsListPreview: wsListPreview
  })
}

// GET /writing-sentence/practice/custom-topic/:id-ws-list-preview
export const getPracticeCustomTopicWSController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const idWsListPreview = req.params.idPreview as string

  const wsListPreview = await databaseService.wsListPreviews.findOne({
    _id: new ObjectId(idWsListPreview)
  })
  if (!wsListPreview) {
    return res.redirect('/writing-sentence/setup')
  }

  const practiceCost = await otherService.getPracticeCost(
    CreditUsageType.writing_sentence_evaluate
  )

  const initResult = await writingService.wsInitChat(
    user._id?.toString() as string,
    (wsListPreview._id?.toString() as string) || ''
  )
  if (!initResult.init_success) {
    return res.redirect('/writing-sentence/setup')
  }

  const userScore = await scoreService.getUserMonthlyScore(user._id as ObjectId)
  const scorePractice = await scoreService.getScoreForPracticeType(
    UserScoreType.WRITING_SENTENCE
  )

  res.render('client/pages/writing-sentence/practice.pug', {
    pageTitle: 'Luyện tập chủ đề',
    user: user,
    ws: wsListPreview as WSList,
    scoreInfo: {
      totalScore: userScore.totalScore,
      scorePractice: scorePractice
    },
    practiceCost: practiceCost || 0
  })
}

// GET /writing-sentence/practice/random
export const getRandomWSController = async (req: Request, res: Response) => {
  const level = req.query.level
    ? new ObjectId(req.query.level as string)
    : undefined
  const topic = req.query.topic
    ? new ObjectId(req.query.topic as string)
    : undefined

  const randomWS = (await writingService.wsRandom(1, level, topic))[0]

  if (!randomWS) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: WRITING_SENTENCE_MESSAGES.RANDOM_WS_NOT_FOUND,
      status: HttpStatus.NOT_FOUND
    })
  }

  res.status(HttpStatus.OK).json({
    message: WRITING_SENTENCE_MESSAGES.RANDOM_WS_SUCCESS,
    status: HttpStatus.OK,
    ws: randomWS
  })
}
