import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import WSList from '~/models/schemas/ws-list.schema'
import { databaseService } from '~/services/database.service'
import writingService from '~/services/writing.service'

// GET /writing-sentence/setup
export const getSetupWritingSentenceController = async (req: Request, res: Response) => {
  const user = req.user as User

  const levels = await databaseService.levels.find({}).sort({ pos: 1 }).toArray()

  res.render('client/pages/writing-sentence/setup.pug', {
    pageTitle: 'Chọn mức độ và chủ đề',
    user: user,
    levels: levels
  })
}

// GET /writing-sentence/system-list
export const getSystemListWSController = async (req: Request, res: Response) => {
  const user = req.user as User

  const level = await databaseService.levels.findOne({
    slug: req.query.level as string
  })
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

// GET /writing-sentence/list
export const getWSListController = async (req: Request, res: Response) => {
  const user = req.user as User
  const find: {
    level?: ObjectId
    type?: ObjectId
    topic?: ObjectId
    page?: number
    limit?: number
  } = {}

  if (req.level) {
    console.log('req.level', req.level)
    find.level = req.level._id
  }
  if (req.type) {
    console.log('req.type', req.type)
    find.type = req.type._id
  }
  if (req.topic) {
    console.log('req.topic', req.topic)
    find.topic = req.topic._id
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

// GET /writing-sentence/practice/:slug
export const getPracticeWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const ws = req.ws as WSList

  const initResult = await writingService.wsInitChat(user._id?.toString() as string, ws._id?.toString() as string)
  if (!initResult.Init_success) {
    return res.redirect('/writing-sentence/setup')
  }

  res.render('client/pages/writing-sentence/practice.pug', {
    pageTitle: 'Luyện tập câu',
    user: user,
    ws
  })
}

// POST /writing-sentence/practice/:slug
export const postPracticeWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const ws = req.ws as WSList
  const { sentence_vi, user_translation } = req.body

  const evaluateResult = await writingService.wsEvaluate(
    user._id?.toString() as string,
    ws._id?.toString() as string,
    sentence_vi,
    user_translation
  )

  console.log('Evaluate result:', evaluateResult)
  console.log('--------------------------------')

  res.status(HttpStatus.OK).json({
    message: 'Đánh giá câu thành công',
    status: HttpStatus.OK,
    user: user,
    evaluateResult: evaluateResult
  })
}

// GET /writing-sentence/practice/complete/:slug
export const getCompleteWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const ws = req.ws as WSList
  try {
    const completeResult = await writingService.wsComplete(user._id!.toString(), ws._id!.toString())
    console.log('Complete result:', completeResult)
    console.log('--------------------------------')
    return res.render('client/pages/writing-sentence/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeHtml: completeResult.Feedback_html
    })
  } catch (err) {
    console.log('Error:', err)
    return res.render('client/pages/writing-sentence/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeHtml: '<p class="text-danger">Không thể lấy đánh giá tổng quan. Vui lòng thử lại.</p>'
    })
  }
}

// POST /writing-sentence/custom-topic/preview
export const postCustomTopicPreviewWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const { topic } = req.body

  const levelDes = req.level.description

  const previewResult = await writingService.wsPreviewCustomTopic(topic, levelDes)

  const wsListPreview = new WSList({
    title: 'Luyện tập chủ đề',
    topic: new ObjectId(),
    level: req.level._id,
    pos: 0,
    slug: (('paractice-custom-topic-' + user._id?.toString()) as string) + '-' + new Date().getTime(),
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
export const getPracticeCustomTopicWSController = async (req: Request, res: Response) => {
  const user = req.user as User
  const idWsListPreview = req.params.idPreview as string

  const wsListPreview = await databaseService.wsListPreviews.findOne({
    _id: new ObjectId(idWsListPreview)
  })
  if (!wsListPreview) {
    return res.redirect('/writing-sentence/setup')
  }

  const initResult = await writingService.wsInitChat(
    user._id?.toString() as string,
    (wsListPreview._id?.toString() as string) || ''
  )
  if (!initResult.Init_success) {
    return res.redirect('/writing-sentence/setup')
  }

  res.render('client/pages/writing-sentence/practice.pug', {
    pageTitle: 'Luyện tập chủ đề',
    user: user,
    ws: wsListPreview as WSList
  })
}
