import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import Levels from '~/models/schemas/levels.schema'
import Topics from '~/models/schemas/topics.schema'
import Types from '~/models/schemas/types.schema'
import User from '~/models/schemas/users.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import WSList from '~/models/schemas/ws-list.schema'
import { databaseService } from '~/services/database.service'
import writingService from '~/services/writing.service'

// GET /writing-paragraph/setup
export const getSetupWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const levels = await databaseService.levels.find({}).toArray()
  const types = await databaseService.types.find({}).toArray()
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

  const data = await writingService.getWPList(find)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách đoạn văn đã lấy thành công',
    status: HttpStatus.OK,
    user: user,
    ...data
  })
}

// GET /writing-paragraph/practice/:slug
export const renderPracticeWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const slug = req.params.slug
  const wp = await databaseService.wpParagraphs.findOne({ slug: slug })
  if (!wp) {
    return res.redirect('/writing-paragraph/setup')
  }

  const initResult = await writingService.wpInitChat(
    user._id?.toString() as string,
    wp._id?.toString() as string,
    wp.content
  )
  if (!initResult.Init_success) {
    return res.redirect('/writing-paragraph/setup')
  }

  res.render('client/pages/writing-paragraph/practice.pug', {
    pageTitle: 'Luyện tập đoạn văn',
    user: user,
    wp: wp
  })
}

// POST /writing-paragraph/practice/:slug
export const postPracticeWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const slug = req.params.slug
  const wp = await databaseService.wpParagraphs.findOne({ slug: slug })
  if (!wp) {
    return res.redirect('/writing-paragraph/setup')
  }
  const { sentence_vi, user_translation } = req.body

  const evaluateResult = await writingService.wpEvaluate(
    user._id?.toString() as string,
    wp._id?.toString() as string,
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

// GET /writing-paragraph/practice/complete/:slug
export const getCompleteWPController = async (req: Request, res: Response) => {
  const user = req.user as User
  const slug = req.params.slug
  const wp = await databaseService.wpParagraphs.findOne({ slug: slug })
  if (!wp) {
    return res.redirect('/writing-paragraph/setup')
  }
  try {
    const completeResult = await writingService.wpComplete(user._id!.toString(), wp._id!.toString())
    console.log('Complete result:', completeResult)
    console.log('--------------------------------')
    return res.render('client/pages/writing-paragraph/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeHtml: completeResult.Feedback_html
    })
  } catch (err) {
    console.log('Error:', err)
    return res.render('client/pages/writing-paragraph/complete.pug', {
      pageTitle: 'Đánh giá tổng quan',
      user,
      completeHtml: `<p class="text-danger">Không thể lấy đánh giá tổng quan.</p> br <p>${err}</p>`
    })
  }
}
