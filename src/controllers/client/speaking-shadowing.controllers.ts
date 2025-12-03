import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import fs from 'node:fs/promises'
import { HistoryUserType, StatusLesson } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import { HisSVUserSentenceType } from '~/models/schemas/his-sv-user.schema'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import speakingServices from '~/services/speaking.service'
import { handleUploadAudio } from '~/utils/file'
import { speechToText } from '~/utils/handle-speech'

// GET /speaking-shadowing
export const renderSpeakingShadowingController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const levels = await databaseService.levels.find({}).toArray()
  const svTopicIds = await databaseService.svShadowings.distinct('topic')
  const topics = await databaseService.topics
    .find({ _id: { $in: svTopicIds } })
    .toArray()

  res.render('client/pages/speaking-shadowing/list.pug', {
    pageTitle: 'Luyện nói Shadowing - Danh sách',
    user,
    levels,
    topics
  })
}

// GET /speaking-shadowing/list
export const getSVListController = async (req: Request, res: Response) => {
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

  const data = await speakingServices.getSVList(find)

  res.status(HttpStatus.OK).json({
    message: 'Danh sách video shadowing đã lấy thành công',
    status: HttpStatus.OK,
    ...data
  })
}

// GET /speaking-shadowing/practice/:slug
export const renderSVPracticeController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug as string
  const sv = await databaseService.svShadowings.findOne({ slug: slug })
  if (!sv) {
    return res.redirect('/speaking-shadowing')
  }

  const hisSVDoc = await databaseService.hisUsers.findOne({
    userId: user._id,
    type: HistoryUserType.PRACTICE_SPEAKING_SHADOWING,
    'content.svShadowingId': sv._id
  })

  res.render('client/pages/speaking-shadowing/practice.pug', {
    pageTitle: 'Luyện tập Shadowing',
    user,
    sv,
    hisSV: hisSVDoc ? hisSVDoc.content : null
  })
}

// POST /speaking-sentence/practice/evaluate
export const evaluateSVController = async (req: Request, res: Response) => {
  const user = req.user as User
  const slug = req.params.slug as string
  const sv = await databaseService.svShadowings.findOne({ slug: slug })
  if (!sv) {
    return res.redirect('/speaking-shadowing')
  }
  try {
    const { fields, file } = await handleUploadAudio(req)
    const enSentenceField = fields.enSentence
    const enSentence = Array.isArray(enSentenceField)
      ? enSentenceField[0]
      : enSentenceField
    if (!enSentence || typeof enSentence !== 'string') {
      await fs.unlink(file.filepath).catch(() => undefined)
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Sentence is required',
        status: HttpStatus.BAD_REQUEST
      })
    }

    const audioBuffer = await fs.readFile(file.filepath)
    await fs.unlink(file.filepath).catch(() => undefined)

    const sttResult = await speechToText(audioBuffer)
    if (!sttResult.success || !sttResult.transcript.trim()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Không thể nhận dạng giọng nói',
        status: HttpStatus.INTERNAL_SERVER_ERROR
      })
    }

    const evaluate = (await speakingServices.speakingEvaluate(
      enSentence,
      sttResult.transcript
    )) as HisSVUserSentenceType

    if (evaluate) {
      await speakingServices.updateHisSVUser(
        user._id?.toString() as string,
        sv._id?.toString() as string,
        evaluate
      )
    }

    res.status(HttpStatus.OK).json({
      message: 'Đánh giá câu phát âm thành công',
      status: HttpStatus.OK,
      evaluate: evaluate
    })
  } catch (error) {
    console.error('Error evaluating speaking shadowing:', error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Không thể đánh giá câu phát âm',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

// DELETE /speaking-shadowing/history/:slug
export const deleteSVHistoryController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug as string
  const sv = await databaseService.svShadowings.findOne({ slug: slug })
  if (!sv) {
    return res.redirect('/speaking-shadowing')
  }
  await speakingServices.deleteSVHistory(
    user._id?.toString() as string,
    sv._id?.toString() as string
  )

  res.status(HttpStatus.OK).json({
    message: 'Lịch sử luyện tập Shadowing đã xóa thành công',
    status: HttpStatus.OK
  })
}
