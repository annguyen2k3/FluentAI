import { ObjectId } from 'mongodb'
import { databaseService } from './database.service'
import {
  ResPromptSpeakingCompletion,
  ResPromptSpeakingInit,
  ResPromptSpeakingSentencePreview
} from '~/models/responses/prompt/res-ss.schema'
import {
  PromptFeature,
  PromptFeatureType,
  StatusLesson
} from '~/constants/enum'
import {
  completeAndDeleteSession,
  resetAndInitSession,
  sendInSession
} from '~/utils/gemini'
import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import HisSSUser, {
  HisSSUserSentenceType
} from '~/models/schemas/his_ss_user.schema'

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

class SpeakingServices {
  async getSSList(find: {
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
          from: 'his_ss_users',
          let: { ssListId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$ssListId', '$$ssListId'] },
                    { $eq: ['$userId', history.userId] }
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
              $or: [{ history: {} }, { 'history.status': { $exists: false } }]
            }
          })
        } else {
          basePipeline.push({
            $match: {
              'history.status': history.status
            }
          })
        }
      }
    }

    const dataPipeline = [...basePipeline, { $skip: skip }, { $limit: limit }]

    const countPipeline = [...basePipeline, { $count: 'total' }]

    const [data, totalResult] = await Promise.all([
      databaseService.ssLists.aggregate(dataPipeline).toArray(),
      databaseService.ssLists.aggregate(countPipeline).toArray()
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

  async speakingInitChat(
    userId: string,
    practiceId: string
  ): Promise<ResPromptSpeakingInit> {
    const prompt = await loadPrompt(
      PromptFeature.SPEAKING,
      PromptFeatureType.INITIALIZATION
    )
    const text = await resetAndInitSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptSpeakingInit
  }

  async speakingEvaluate(
    userId: string,
    practiceId: string,
    enSentence: string,
    audio_data: string
  ): Promise<ResPromptSpeakingSentencePreview> {
    const promptTpl = await loadPrompt(
      PromptFeature.SPEAKING,
      PromptFeatureType.SPEAKING_PREVIEW
    )
    const prompt = fillTemplate(promptTpl, {
      enSentence,
      audio_data
    })
    const text = await sendInSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptSpeakingSentencePreview
  }

  async speakingComplete(
    userId: string,
    practiceId: string
  ): Promise<ResPromptSpeakingCompletion> {
    const prompt = await loadPrompt(
      PromptFeature.SPEAKING,
      PromptFeatureType.COMPLETION
    )
    const text = await completeAndDeleteSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as ResPromptSpeakingCompletion
  }

  async updateHisSSUser(
    userId: string,
    practiceId: string,
    sentence: HisSSUserSentenceType
  ) {
    const hisSSUser = await databaseService.hisSSUsers.findOne({
      userId: new ObjectId(userId),
      ssListId: new ObjectId(practiceId)
    })

    if (!hisSSUser) {
      const newHisSSUser = new HisSSUser({
        userId: new ObjectId(userId),
        ssListId: new ObjectId(practiceId),
        status: StatusLesson.IN_PROGRESS,
        sentences: [sentence]
      })
      await databaseService.hisSSUsers.insertOne(newHisSSUser)
      return
    }

    const sentences = [...hisSSUser.sentences]
    const existingIndex = sentences.findIndex(
      (item) => item.enSentence === sentence.enSentence
    )

    if (existingIndex >= 0) {
      sentences[existingIndex] = sentence
    } else {
      sentences.push(sentence)
    }

    const ssList = await databaseService.ssLists.findOne({
      _id: hisSSUser.ssListId
    })

    if (!ssList?.list?.length) {
      return
    }

    const allPassed = ssList.list.every((originalSentence) => {
      const historySentence = sentences.find(
        (item) => item.enSentence === originalSentence.enSentence
      )
      return Boolean(historySentence && historySentence.passed)
    })

    const setFields: Record<string, unknown> = { sentences }

    if (allPassed) {
      setFields.status = StatusLesson.COMPLETED
    } else {
      setFields.status = StatusLesson.IN_PROGRESS
    }

    await databaseService.hisSSUsers.updateOne(
      { _id: hisSSUser._id },
      { $set: setFields }
    )
  }

  async deleteSSHistory(userId: string, practiceId: string) {
    await databaseService.hisSSUsers.deleteOne({
      userId: new ObjectId(userId),
      ssListId: new ObjectId(practiceId)
    })
  }
}

const speakingServices = new SpeakingServices()
export default speakingServices
