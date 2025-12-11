import { ObjectId } from 'mongodb'
import { databaseService } from './database.service'
import {
  ResPromptSpeakingCompletion,
  ResPromptSpeakingInit,
  ResPromptSpeakingSentencePreview,
  ResPromptSpeakingTopicPreview
} from '~/models/responses/prompt/res-ss.schema'
import {
  PromptFeature,
  PromptFeatureType,
  StatusLesson,
  HistoryUserType
} from '~/constants/enum'
import {
  completeAndDeleteSession,
  resetAndInitSession,
  sendInSession,
  sendMessageOnce
} from '~/utils/gemini'
import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import SSList from '~/models/schemas/ss-list.schema'
import SVShadowing from '~/models/schemas/sv-shadowing.schema'
import HisSSUser, {
  HisSSUserSentenceType
} from '~/models/schemas/his-ss-user.schema'
import HisSVUser, {
  HisSVUserSentenceType
} from '~/models/schemas/his-sv-user.schema'
import HisPracticeUser from '~/models/schemas/his-practice-user.schema'

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
    isActive?: boolean
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
      isActive,
      history,
      ...matchQuery
    } = find
    const skip = (page - 1) * limit
    const matchStage: Record<string, unknown> = {}
    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic
    if (matchQuery.search)
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }
    if (typeof isActive === 'boolean') matchStage.isActive = isActive
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
    const text = await sendMessageOnce(prompt)
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

  async previewSSTopic(description: string) {
    const promptTpl = await loadPrompt(
      PromptFeature.SPEAKING,
      PromptFeatureType.PREVIEW_TOPIC
    )
    const prompt = fillTemplate(promptTpl, {
      description_topic: description
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as ResPromptSpeakingTopicPreview
  }

  async getSVList(find: {
    level?: ObjectId
    topic?: ObjectId
    isActive?: boolean
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
      isActive,
      ...matchQuery
    } = find

    const skip = (page - 1) * limit
    const matchStage: Record<string, unknown> = {}

    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic
    if (matchQuery.search) {
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }
    }
    if (isActive !== undefined) matchStage.isActive = isActive

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
      // Lấy history từ collection his_users (đã tối ưu), lọc theo user + type + svShadowingId
      basePipeline.push({
        $lookup: {
          from: 'his_practice_users',
          let: { svId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', history.userId] },
                    {
                      $eq: [
                        '$type',
                        HistoryUserType.PRACTICE_SPEAKING_SHADOWING
                      ]
                    },
                    { $eq: ['$content.svShadowingId', '$$svId'] }
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
      databaseService.svShadowings.aggregate(dataPipeline).toArray(),
      databaseService.svShadowings.aggregate(countPipeline).toArray()
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

  async updateHisSVUser(
    userId: string,
    practiceId: string,
    sentence: HisSVUserSentenceType
  ) {
    const userObjectId = new ObjectId(userId)
    const practiceObjectId = new ObjectId(practiceId)

    const hisPracticeUser = await databaseService.hisPracticeUsers.findOne({
      userId: userObjectId,
      type: HistoryUserType.PRACTICE_SPEAKING_SHADOWING,
      'content.svShadowingId': practiceObjectId
    })

    if (!hisPracticeUser) {
      const newHisSVUser = new HisSVUser({
        svShadowingId: practiceObjectId,
        status: StatusLesson.IN_PROGRESS,
        sentences: [sentence]
      })

      const newHisPracticeUser = new HisPracticeUser({
        userId: userObjectId,
        type: HistoryUserType.PRACTICE_SPEAKING_SHADOWING,
        content: newHisSVUser
      })

      await databaseService.hisPracticeUsers.insertOne(newHisPracticeUser)
      return
    }

    const currentContent = hisPracticeUser.content as HisSVUser
    const sentences = [...(currentContent.sentences || [])]

    const existingIndex = sentences.findIndex(
      (item) => item.enSentence === sentence.enSentence
    )

    if (existingIndex >= 0) {
      sentences[existingIndex] = sentence
    } else {
      sentences.push(sentence)
    }

    const svShadowing = await databaseService.svShadowings.findOne({
      _id: currentContent.svShadowingId
    })

    if (!svShadowing?.transcript?.length) {
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

    const allPassed = svShadowing.transcript.every((originalSentence) => {
      const historySentence = sentences.find(
        (item) =>
          item.enSentence === originalSentence.enText ||
          (item as any).enText === originalSentence.enText
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

  async deleteSVHistory(userId: string, practiceId: string) {
    await databaseService.hisPracticeUsers.deleteOne({
      userId: new ObjectId(userId),
      type: HistoryUserType.PRACTICE_SPEAKING_SHADOWING,
      'content.svShadowingId': new ObjectId(practiceId)
    })
  }

  async createSSList(ssList: SSList) {
    const newSSList = new SSList(ssList)
    await databaseService.ssLists.insertOne(newSSList)
    return newSSList
  }

  async updateSSList(ssList: SSList) {
    await databaseService.ssLists.updateOne(
      { _id: ssList._id },
      { $set: ssList }
    )
    return ssList
  }

  async deleteSSList(id: string) {
    await databaseService.ssLists.deleteOne({ _id: new ObjectId(id) })
    return true
  }

  async createSVShadowing(svShadowing: SVShadowing) {
    const newSVShadowing = new SVShadowing(svShadowing)
    await databaseService.svShadowings.insertOne(newSVShadowing)
    return newSVShadowing
  }

  async updateSVShadowing(svShadowing: SVShadowing) {
    await databaseService.svShadowings.updateOne(
      { _id: svShadowing._id },
      { $set: svShadowing }
    )
    return svShadowing
  }

  async deleteSVShadowing(id: string) {
    await databaseService.svShadowings.deleteOne({ _id: new ObjectId(id) })
    return true
  }
}

const speakingServices = new SpeakingServices()
export default speakingServices
