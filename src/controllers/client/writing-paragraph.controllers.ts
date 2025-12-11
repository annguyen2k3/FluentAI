import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { CreditUsageType, StatusLesson, UserScoreType } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import { WRITING_PARAGRAPH_MESSAGES } from '~/constants/message'
import Levels from '~/models/schemas/levels.schema'
import Topics from '~/models/schemas/topics.schema'
import Types from '~/models/schemas/types.schema'
import User from '~/models/schemas/users.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import WSList from '~/models/schemas/ws-list.schema'
import { databaseService } from '~/services/database.service'
import otherService from '~/services/other.service'
import scoreService from '~/services/score.service'
import writingService from '~/services/writing.service'

// GET /writing-paragraph/setup
export const getSetupWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const levels = await databaseService.levels
    .find({})
    .sort({ pos: 1 })
    .toArray()
  const types = await databaseService.types.find({}).sort({ pos: 1 }).toArray()
  res.render('client/pages/writing-paragraph/setup.pug', {
    pageTitle: 'Chọn mức độ và chủ đề',
    user: user,
    levels: levels,
    types: types
  })
}

// GET /writing-paragraph/system-list
export const renderListWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const level = req.level as Levels
  const type = req.type as Types

  if (!level || !type) {
    return res.redirect('/writing-paragraph/setup')
  }

  const topics = await databaseService.wpParagraphs
    .aggregate([
      {
        $match: {
          level: level._id,
          type: type._id
        }
      },
      {
        $group: {
          _id: '$topic'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topic'
        }
      },
      { $unwind: '$topic' },
      {
        $replaceRoot: {
          newRoot: '$topic'
        }
      },
      {
        $sort: {
          title: 1
        }
      }
    ])
    .toArray()

  res.render('client/pages/writing-paragraph/list.pug', {
    pageTitle: 'Danh sách đoạn văn',
    user: user,
    topics: topics,
    level: level,
    type: type
  })
}

// GET /writing-paragraph/list
export const getWPListController = async (req: Request, res: Response) => {
  const user = req.user as User

  const find: {
    level?: ObjectId
    topic?: ObjectId
    type?: ObjectId
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

  if (req.level) {
    find.level = req.level._id
  }
  if (req.topic) {
    find.topic = req.topic._id
  }
  if (req.type) {
    find.type = req.type._id
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
  const data = await writingService.getWPList(find)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách đoạn văn đã lấy thành công',
    status: HttpStatus.OK,
    user: user,
    ...data
  })
}

// GET /writing-paragraph/practice/:slug
export const renderPracticeWPController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const wp = req.wp as WPParagraph

  const hisWPUser = await writingService.getHisWPUser(
    user._id?.toString() as string,
    wp._id?.toString() as string
  )

  const initResult = await writingService.wpInitChat(
    user._id?.toString() as string,
    wp._id?.toString() as string,
    wp.content
  )
  if (!initResult.init_success) {
    return res.redirect('/writing-paragraph/setup')
  }

  const userScore = await scoreService.getUserMonthlyScore(user._id as ObjectId)
  const scorePractice = await scoreService.getScoreForPracticeType(
    UserScoreType.WRITING_PARAGRAPH
  )

  const practiceCost = await otherService.getPracticeCost(
    CreditUsageType.writing_paragraph_evaluate
  )

  res.render('client/pages/writing-paragraph/practice.pug', {
    pageTitle: 'Luyện tập đoạn văn',
    user: user,
    wp: wp,
    hisWPUser: hisWPUser,
    scoreInfo: {
      totalScore: userScore.totalScore,
      scorePractice: scorePractice
    },
    practiceCost: practiceCost || 0
  })
}

// POST /writing-paragraph/practice/:slug
export const postPracticeWPController = async (req: Request, res: Response) => {
  const user = req.user as any
  const wp = req.wp as WPParagraph
  const { sentence_vi, user_translation } = req.body

  const practiceCostResult = await otherService.handlePracticeCost({
    wallet_id: user.wallet._id?.toString() as string,
    type: CreditUsageType.writing_paragraph_evaluate
  })
  if (!practiceCostResult.success) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: practiceCostResult.message,
      status: HttpStatus.BAD_REQUEST
    })
  }

  const evaluateResult = await writingService.wpEvaluate(
    user._id?.toString() as string,
    wp._id?.toString() as string,
    sentence_vi,
    user_translation
  )

  if (evaluateResult.passed) {
    await writingService.updateHisWPUser(
      user._id?.toString() as string,
      wp._id?.toString() as string,
      evaluateResult
    )

    await scoreService.addScore(
      user._id as ObjectId,
      UserScoreType.WRITING_PARAGRAPH,
      wp._id as ObjectId,
      wp.title
    )
  }

  res.status(HttpStatus.OK).json({
    message: 'Đánh giá câu thành công',
    status: HttpStatus.OK,
    user: user,
    evaluateResult: evaluateResult
  })
}

// DELETE /writing-paragraph/practice/history/:slug
export const deleteHistoryPracticeWPController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug as string
  const wp = await databaseService.wpParagraphs.findOne({ slug: slug })
  if (!wp) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Không tìm thấy bài học',
      status: HttpStatus.NOT_FOUND
    })
  }
  await writingService.deleteHisWPUser(
    user._id?.toString() as string,
    wp._id?.toString() as string
  )
  return res.status(HttpStatus.OK).json({
    message: 'Xóa lịch sử luyện tập thành công',
    status: HttpStatus.OK
  })
}

// GET /writing-paragraph/practice/complete/:slug
export const getCompleteWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const wp = req.wp as WPParagraph
  await writingService.updateHisWPUser(
    user._id?.toString() as string,
    wp._id?.toString() as string,
    undefined,
    true
  )
  try {
    const completeResult = await writingService.wpComplete(
      user._id!.toString(),
      wp._id!.toString()
    )
    return res.render('client/pages/writing-paragraph/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeResult: completeResult
    })
  } catch (err) {
    return res.render('client/pages/writing-paragraph/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeHtml: `<p class="text-danger">Không thể lấy đánh giá tổng quan.</p> br <p>${err}</p>`
    })
  }
}

// POST /writing-paragraph/custom-topic/preview
export const postCustomTopicPreviewWPController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const { topic } = req.body
  const level = req.level as Levels
  const previewResult = await writingService.wpPreviewCustomTopic(
    topic,
    level.description
  )

  const wpParagraph = new WPParagraph({
    title: previewResult.title,
    content: previewResult.content,
    hint: previewResult.hint,
    level: level._id as ObjectId,
    topic: new ObjectId(),
    type: new ObjectId(),
    slug:
      (('paractice-custom-topic-' + user._id?.toString()) as string) +
      '-' +
      new Date().getTime()
  })

  if (previewResult.passed) {
    await databaseService.wpPreviews.insertOne(wpParagraph)
  }

  res.status(HttpStatus.OK).json({
    message: 'Xem trước chủ đề thành công',
    status: HttpStatus.OK,
    user: user,
    previewResult: previewResult,
    wpPreview: wpParagraph
  })
}

// GET /writing-paragraph/practice/custom-topic/:idPreview
export const getPracticeCustomTopicWPController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const idPreview = req.params.idPreview as string
  const wpPreview = await databaseService.wpPreviews.findOne({
    _id: new ObjectId(idPreview)
  })
  if (!wpPreview) {
    return res.redirect('/writing-paragraph/setup')
  }

  const initResult = await writingService.wpInitChat(
    user._id?.toString() as string,
    wpPreview._id?.toString() as string,
    wpPreview.content
  )
  if (!initResult.init_success) {
    return res.redirect('/writing-paragraph/setup')
  }

  const userScore = await scoreService.getUserMonthlyScore(user._id as ObjectId)
  const scorePractice = await scoreService.getScoreForPracticeType(
    UserScoreType.WRITING_PARAGRAPH
  )

  const practiceCost = await otherService.getPracticeCost(
    CreditUsageType.writing_paragraph_evaluate
  )

  res.render('client/pages/writing-paragraph/practice.pug', {
    pageTitle: 'Luyện tập chủ đề',
    user: user,
    wp: wpPreview,
    scoreInfo: {
      totalScore: userScore.totalScore,
      scorePractice: scorePractice
    },
    practiceCost: practiceCost || 0
  })
}

// POST /writing-paragraph/preview-content
export const postPreviewContentWPController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const { content } = req.body
  const previewResult = await writingService.wpPreviewContent(content)

  const wpParagraph = new WPParagraph({
    title: previewResult.title,
    content: previewResult.content,
    hint: previewResult.hint,
    level: new ObjectId(),
    topic: new ObjectId(),
    type: new ObjectId(),
    slug:
      (('paractice-custom-content-' + user._id?.toString()) as string) +
      '-' +
      new Date().getTime()
  })

  if (previewResult.passed) {
    await databaseService.wpPreviews.insertOne(wpParagraph)
  }

  res.status(HttpStatus.OK).json({
    message: 'Xem trước nội dung thành công',
    status: HttpStatus.OK,
    user: user,
    previewResult: previewResult,
    wpPreview: wpParagraph
  })
}

// GET /writing-paragraph/random
export const getRandomWPController = async (req: Request, res: Response) => {
  const level = req.query.level
    ? new ObjectId(req.query.level as string)
    : undefined
  const topic = req.query.topic
    ? new ObjectId(req.query.topic as string)
    : undefined
  const type = req.query.type
    ? new ObjectId(req.query.type as string)
    : undefined
  const randomWP = (await writingService.wpRandom(1, level, topic, type))[0]
  if (!randomWP) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: WRITING_PARAGRAPH_MESSAGES.WP_LIST_NOT_FOUND,
      status: HttpStatus.NOT_FOUND
    })
  }
  return res.status(HttpStatus.OK).json({
    message: WRITING_PARAGRAPH_MESSAGES.RANDOM_WP_SUCCESS,
    status: HttpStatus.OK,
    wp: randomWP
  })
}
