import { ObjectId } from 'mongodb'
import { databaseService } from './database.service'
import { config } from 'dotenv'
import {
  resetAndInitSession,
  sendInSession,
  completeAndDeleteSession,
  sendMessageOnce
} from '~/utils/gemini'
import {
  PromptFeature,
  PromptFeatureType,
  StatusLesson,
  HistoryUserType
} from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import WSList, { SentenceWriteType } from '~/models/schemas/ws-list.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import { VocabularyHintType } from '~/models/Other'
import {
  ResPromptWritingCompletion,
  ResPromptWritingInit,
  ResPromptWritingTranslation,
  ResPromptWSPreviewTopic
} from '~/models/responses/prompt/res-ws.schema'
import {
  ResPromptWritingParagraphCompletion,
  ResPromptWritingParagraphInit,
  ResPromptWritingParagraphPreviewTopic,
  ResPromptWritingParagraphTranslation
} from '~/models/responses/prompt/res-wp.schema'
import { HisWSUserSentenceType } from '~/models/schemas/his-ws-user.schema'
import HisWSUser from '~/models/schemas/his-ws-user.schema'
import HisUser from '~/models/schemas/his-practice-user.schema'
import HisPracticeUser from '~/models/schemas/his-practice-user.schema'
config()

function sk(userId: string, practiceId: string) {
  return `${userId}_${practiceId}`
}

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return Object.keys(vars).reduce(
    (s, k) => s.replaceAll(`{{${k}}}`, vars[k]),
    tpl
  )
}

async function loadPrompt(
  feature: PromptFeature,
  featureType: PromptFeatureType
) {
  const doc = await databaseService.prompts.findOne({
    feature: feature,
    feature_type: featureType,
    status: true
  })
  if (!doc?.content)
    throw new ErrorWithStatus(
      `Prompt not found: ${featureType}`,
      HttpStatus.NOT_FOUND
    )
  return doc.content
}

class WritingService {
  async getWSList(find: {
    level?: ObjectId
    topic?: ObjectId
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    history?: {
      userId: ObjectId
      status?: StatusLesson
    }
  }) {
    const {
      page = 1,
      limit = 10,
      sortKey = 'pos',
      sortOrder = 'asc',
      history,
      ...matchQuery
    } = find
    const skip = (page - 1) * limit
    const matchStage: Record<string, unknown> = {}
    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic
    if (matchQuery.search)
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }

    const basePipeline: Record<string, unknown>[] = [
      { $match: matchStage },
      {
        $sort: {
          [sortKey]: sortOrder === 'asc' ? 1 : -1
        }
      },
      {
        $lookup: {
          from: 'levels',
          localField: 'level',
          foreignField: '_id',
          as: 'level'
        }
      },
      { $unwind: '$level' },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic'
        }
      },
      { $unwind: '$topic' }
    ]

    if (history?.userId) {
      basePipeline.push({
        $lookup: {
          from: 'his_practice_users',
          let: { wsId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', history.userId] },
                    {
                      $eq: ['$type', HistoryUserType.PRACTICE_WRITING_SENTENCE]
                    },
                    { $eq: ['$content.wsListId', '$$wsId'] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'history'
        }
      })

      basePipeline.push({
        $addFields: {
          history: { $arrayElemAt: ['$history', 0] }
        }
      })

      basePipeline.push({
        $addFields: {
          history: {
            $cond: [{ $ifNull: ['$history', false] }, '$history', {}]
          }
        }
      })

      if (history.status) {
        if (history.status === StatusLesson.NOT_STARTED) {
          basePipeline.push({
            $match: {
              $or: [
                { history: {} },
                { 'history.content.status': { $exists: false } }
              ]
            }
          })
        } else {
          basePipeline.push({
            $match: {
              'history.content.status': history.status
            }
          })
        }
      }
    }

    const dataPipeline = [...basePipeline, { $skip: skip }, { $limit: limit }]
    const countPipeline = [...basePipeline, { $count: 'total' }]

    const [data, totalResult] = await Promise.all([
      databaseService.wsLists.aggregate(dataPipeline).toArray(),
      databaseService.wsLists.aggregate(countPipeline).toArray()
    ])

    const total = totalResult[0]?.total || 0

    const totalPages = Math.ceil(total / limit)
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }

  // 1) Khởi tạo chat cho user + practiceId, prompt lấy từ DB
  async wsInitChat(
    userId: string,
    practiceId: string
  ): Promise<ResPromptWritingInit> {
    const prompt = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptFeatureType.INITIALIZATION
    )
    const text = await resetAndInitSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptWritingInit
  }

  // 2) Đánh giá từng câu
  async wsEvaluate(
    userId: string,
    practiceId: string,
    sentence_vi: string,
    user_translation: string
  ): Promise<ResPromptWritingTranslation> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptFeatureType.TRANSLATION
    )
    const prompt = fillTemplate(promptTpl, {
      sentence_vi,
      user_translation
    })
    const text = await sendInSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptWritingTranslation
  }

  // 3) Đánh giá tổng quan + kết thúc chat
  async wsComplete(
    userId: string,
    practiceId: string
  ): Promise<ResPromptWritingCompletion> {
    const prompt = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptFeatureType.COMPLETION
    )
    const text = await completeAndDeleteSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptWritingCompletion
  }

  // Xem trước chủ đề tạo bằng AI
  async wsPreviewCustomTopic(
    description_topic: string,
    description_level: string
  ): Promise<ResPromptWSPreviewTopic> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptFeatureType.PREVIEW_TOPIC
    )
    const prompt = fillTemplate(promptTpl, {
      description_topic,
      description_level
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as ResPromptWSPreviewTopic
  }

  async createWSList(wsList: WSList) {
    const newWSList = new WSList(wsList)
    await databaseService.wsLists.insertOne(newWSList)
    return newWSList
  }

  async updateWSList(wsList: WSList) {
    await databaseService.wsLists.updateOne(
      { _id: wsList._id },
      { $set: wsList }
    )
    return wsList
  }

  async deleteWSList(id: string) {
    await databaseService.wsLists.deleteOne({ _id: new ObjectId(id) })
    return true
  }

  async updateHisWSUser(
    userId: string,
    practiceId: string,
    sentence: HisWSUserSentenceType
  ) {
    const userObjectId = new ObjectId(userId)
    const practiceObjectId = new ObjectId(practiceId)

    const hisPracticeUser = await databaseService.hisPracticeUsers.findOne({
      userId: userObjectId,
      type: HistoryUserType.PRACTICE_WRITING_SENTENCE,
      'content.wsListId': practiceObjectId
    })

    if (!hisPracticeUser) {
      const newHisWSUser = new HisWSUser({
        wsListId: practiceObjectId,
        status: StatusLesson.IN_PROGRESS,
        sentences: [sentence]
      })

      const newHisPracticeUser = new HisPracticeUser({
        userId: userObjectId,
        type: HistoryUserType.PRACTICE_WRITING_SENTENCE,
        content: newHisWSUser
      })

      await databaseService.hisPracticeUsers.insertOne(newHisPracticeUser)
      return
    }

    const currentContent = hisPracticeUser.content as HisWSUser
    const sentences = [...(currentContent.sentences || [])]

    const existingIndex = sentences.findIndex(
      (item) => item.sentence_original === sentence.sentence_original
    )

    if (existingIndex >= 0) {
      sentences[existingIndex] = sentence
    } else {
      sentences.push(sentence)
    }

    const wsList = await databaseService.wsLists.findOne({
      _id: currentContent.wsListId
    })

    if (!wsList?.list?.length) {
      await databaseService.hisPracticeUsers.updateOne(
        { _id: hisPracticeUser._id },
        {
          $set: {
            'content.sentences': sentences,
            'content.status': StatusLesson.IN_PROGRESS,
            update_at: new Date()
          }
        }
      )
      return
    }

    const allPassed = wsList.list.every((originalSentence) => {
      const historySentence = sentences.find(
        (item) => item.sentence_original === originalSentence.content
      )
      return Boolean(historySentence && historySentence.passed)
    })

    const setFields: Record<string, unknown> = {
      'content.sentences': sentences,
      'content.status': allPassed
        ? StatusLesson.COMPLETED
        : StatusLesson.IN_PROGRESS,
      update_at: new Date()
    }

    await databaseService.hisPracticeUsers.updateOne(
      { _id: hisPracticeUser._id },
      {
        $set: setFields
      }
    )
  }

  async getWPList(find: {
    level?: ObjectId
    topic?: ObjectId
    type?: ObjectId
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const { page = 1, limit = 10, ...matchQuery } = find
    const skip = (page - 1) * limit
    const matchStage: any = {}
    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic
    if (matchQuery.type) matchStage.type = matchQuery.type
    if (matchQuery.search)
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }

    const [data, total] = await Promise.all([
      databaseService.wpParagraphs
        .aggregate([
          { $match: matchStage },
          {
            $sort: {
              [matchQuery.sortKey as string]:
                matchQuery.sortOrder === 'asc' ? 1 : -1
            }
          },
          {
            $lookup: {
              from: 'levels',
              localField: 'level',
              foreignField: '_id',
              as: 'level'
            }
          },
          { $unwind: '$level' },
          {
            $lookup: {
              from: 'topics',
              localField: 'topic',
              foreignField: '_id',
              as: 'topic'
            }
          },
          { $unwind: '$topic' },
          {
            $lookup: {
              from: 'types',
              localField: 'type',
              foreignField: '_id',
              as: 'type'
            }
          },
          { $unwind: '$type' },
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray(),
      databaseService.wpParagraphs.countDocuments(matchStage)
    ])

    const totalPages = Math.ceil(total / limit)
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }

  async createWPParagraph(wpParagraph: WPParagraph) {
    const newWPParagraph = new WPParagraph(wpParagraph)
    await databaseService.wpParagraphs.insertOne(newWPParagraph)
    return newWPParagraph
  }

  async updateWPParagraph(wpParagraph: WPParagraph) {
    await databaseService.wpParagraphs.updateOne(
      { _id: wpParagraph._id },
      { $set: wpParagraph }
    )
    return wpParagraph
  }

  async deleteWPParagraph(id: string) {
    await databaseService.wpParagraphs.deleteOne({ _id: new ObjectId(id) })
    return true
  }

  async wpInitChat(
    userId: string,
    practiceId: string,
    wp_paragraph: string
  ): Promise<ResPromptWritingParagraphInit> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptFeatureType.INITIALIZATION
    )
    const prompt = fillTemplate(promptTpl, {
      wp_paragraph
    })
    const text = await resetAndInitSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptWritingParagraphInit
  }

  async wpEvaluate(
    userId: string,
    practiceId: string,
    sentence_vi: string,
    user_translation: string
  ): Promise<ResPromptWritingParagraphTranslation> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptFeatureType.TRANSLATION
    )
    const prompt = fillTemplate(promptTpl, {
      sentence_vi,
      user_translation
    })
    const text = await sendInSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptWritingParagraphTranslation
  }

  async wpComplete(
    userId: string,
    practiceId: string
  ): Promise<ResPromptWritingParagraphCompletion> {
    const prompt = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptFeatureType.COMPLETION
    )
    const text = await completeAndDeleteSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptWritingParagraphCompletion
  }

  async wpPreviewCustomTopic(
    description_topic: string,
    description_level: string
  ): Promise<ResPromptWritingParagraphPreviewTopic> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptFeatureType.PREVIEW_TOPIC
    )
    const prompt = fillTemplate(promptTpl, {
      description_topic,
      description_level
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as ResPromptWritingParagraphPreviewTopic
  }

  async wpPreviewContent(
    content: string
  ): Promise<ResPromptWritingParagraphPreviewTopic> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptFeatureType.PREVIEW_CONTENT
    )
    const prompt = fillTemplate(promptTpl, {
      content
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as ResPromptWritingParagraphPreviewTopic
  }

  async wsRandom(size: number, level?: ObjectId, topic?: ObjectId) {
    const matchStage: any = {}
    if (level) matchStage.level = level
    if (topic) matchStage.topic = topic
    const pipeline = []
    if (Object.keys(matchStage).length) {
      pipeline.push({ $match: matchStage })
    }
    pipeline.push({ $sample: { size } })

    const randomWS = await databaseService.wsLists.aggregate(pipeline).toArray()
    return randomWS as WSList[]
  }

  async wpRandom(
    size: number,
    level?: ObjectId,
    topic?: ObjectId,
    type?: ObjectId
  ) {
    const matchStage: any = {}
    if (level) matchStage.level = level
    if (topic) matchStage.topic = topic
    if (type) matchStage.type = type
    const pipeline = []
    if (Object.keys(matchStage).length) {
      pipeline.push({ $match: matchStage })
    }
    pipeline.push({ $sample: { size } })

    const randomWP = await databaseService.wpParagraphs
      .aggregate(pipeline)
      .toArray()
    return randomWP as WPParagraph[]
  }
}

const writingService = new WritingService()
export default writingService
