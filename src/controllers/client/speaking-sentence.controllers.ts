import { Request, Response } from 'express'
import fs from 'node:fs/promises'
import { ObjectId } from 'mongodb'
import { CreditUsageType, StatusLesson, UserScoreType } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import SSList from '~/models/schemas/ss-list.schema'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import otherService from '~/services/other.service'
import speakingServices from '~/services/speaking.service'
import { handleUploadAudio } from '~/utils/file'
import { speechToText, textToSpeech } from '~/utils/handle-speech'
import { HisSSUserSentenceType } from '~/models/schemas/his-ss-user.schema'
import scoreService from '~/services/score.service'

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
    userId: user._id,
    ssListId: ss._id
  })

  const userScore = await scoreService.getUserMonthlyScore(user._id as ObjectId)
  const scorePractice = await scoreService.getScoreForPracticeType(
    UserScoreType.SPEAKING_SENTENCE
  )

  const practiceCost = await otherService.getPracticeCost(
    CreditUsageType.speaking_sentence_evaluate
  )

  res.render('client/pages/speaking-sentence/practice.pug', {
    pageTitle: 'Luyện tập câu phát âm',
    user,
    ss,
    hisSS,
    scoreInfo: {
      totalScore: userScore.totalScore,
      scorePractice: scorePractice
    },
    practiceCost: practiceCost || 0
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

// POST /speaking-sentence/practice/evaluate
export const evaluateSSController = async (req: Request, res: Response) => {
  const user = req.user as any
  const slug = req.params.slug as string
  const ss = await databaseService.ssLists.findOne({ slug: slug })
  if (!ss) {
    return res.redirect('/speaking-sentence')
  }

  const practiceCostResult = await otherService.handlePracticeCost({
    wallet_id: user.wallet._id?.toString() as string,
    type: CreditUsageType.speaking_sentence_evaluate
  })
  if (!practiceCostResult.success) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: practiceCostResult.message,
      status: HttpStatus.BAD_REQUEST
    })
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
    )) as HisSSUserSentenceType

    if (evaluate) {
      await speakingServices.updateHisSSUser(
        user._id?.toString() as string,
        ss._id?.toString() as string,
        evaluate
      )

      if (evaluate.passed) {
        await scoreService.addScore(
          user._id as ObjectId,
          UserScoreType.SPEAKING_SENTENCE,
          ss._id as ObjectId,
          ss.title
        )
      }
    }

    res.status(HttpStatus.OK).json({
      message: 'Đánh giá câu phát âm thành công',
      status: HttpStatus.OK,
      evaluate: evaluate
    })
  } catch (error) {
    console.error('Error evaluating speaking sentence:', error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Không thể đánh giá câu phát âm',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}

// DELETE /speaking-sentence/history/:slug
export const deleteSSHistoryController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const slug = req.params.slug as string
  const ss = await databaseService.ssLists.findOne({ slug: slug })
  if (!ss) {
    return res.redirect('/speaking-sentence')
  }

  await speakingServices.deleteSSHistory(
    user._id?.toString() as string,
    ss._id?.toString() as string
  )

  res.status(HttpStatus.OK).json({
    message: 'Lịch sử câu phát âm đã xóa thành công',
    status: HttpStatus.OK
  })
}

// POST /speaking-sentence/preview-topic
export const previewSSTopicController = async (req: Request, res: Response) => {
  const { description } = req.body
  const previewResult = await speakingServices.previewSSTopic(description)
  res.status(HttpStatus.OK).json({
    message: 'Xem trước chủ đề thành công',
    status: HttpStatus.OK,
    previewResult: previewResult
  })
}

// GET /speaking-sentence/practice-custom-topic
export const renderSSPracticeCustomTopicController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User

  const userScore = await scoreService.getUserMonthlyScore(user._id as ObjectId)
  const scorePractice = await scoreService.getScoreForPracticeType(
    UserScoreType.SPEAKING_SENTENCE
  )

  const practiceCost = await otherService.getPracticeCost(
    CreditUsageType.speaking_sentence_evaluate
  )

  res.render('client/pages/speaking-sentence/practice-custom-topic.pug', {
    pageTitle: 'Luyện tập câu phát âm - Chủ đề tùy chỉnh',
    user: user,
    scoreInfo: {
      totalScore: userScore.totalScore,
      scorePractice: scorePractice
    },
    practiceCost: practiceCost || 0
  })
}

// POST /speaking-sentence/practice/custom-topic/evaluate
export const evaluateSSCustomTopicController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as any

  const practiceCostResult = await otherService.handlePracticeCost({
    wallet_id: user.wallet._id?.toString() as string,
    type: CreditUsageType.speaking_sentence_evaluate
  })
  if (!practiceCostResult.success) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: practiceCostResult.message,
      status: HttpStatus.BAD_REQUEST
    })
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
    )) as HisSSUserSentenceType

    if (evaluate.passed) {
      await scoreService.addScore(
        user._id as ObjectId,
        UserScoreType.SPEAKING_SENTENCE,
        null as any,
        'Chủ đề tùy chỉnh'
      )
    }
    res.status(HttpStatus.OK).json({
      message: 'Đánh giá câu phát âm thành công',
      status: HttpStatus.OK,
      evaluate: evaluate
    })
  } catch (error) {
    console.error('Error evaluating speaking custom topic:', error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Không thể đánh giá câu phát âm',
      status: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}
