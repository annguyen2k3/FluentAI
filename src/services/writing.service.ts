import { ObjectId } from 'mongodb'
import { databaseService } from './database.service'
import { config } from 'dotenv'
import {
  resetAndInitSession,
  sendInSession,
  completeAndDeleteSession,
  sendMessageOnce
} from '~/utils/gemini'
import { PromptFeature, PromptWritingType } from '~/constants/enum'
import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import WSList, { SentenceWriteType } from '~/models/schemas/ws-list.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import { VocabularyHintType } from '~/models/Other'
config()

type EvaluateResult = { Passed: boolean; Feedback_html: string }
type InitResult = { Init_success: boolean }
type PreviewTopicWSResult = {
  passed: boolean
  description: string
  list: SentenceWriteType[]
}

type PreviewTopicWPResult = {
  passed: boolean
  description: string
  title: string
  content: string
  hint: VocabularyHintType[]
}

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
  writingType: PromptWritingType
) {
  const doc = await databaseService.prompts.findOne({
    feature: feature,
    writing_type: writingType,
    status: true
  })
  if (!doc?.content)
    throw new ErrorWithStatus(
      `Prompt not found: ${writingType}`,
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
  }) {
    const { page = 1, limit = 10, ...matchQuery } = find
    const skip = (page - 1) * limit
    const matchStage: any = {}
    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic
    if (matchQuery.search)
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }

    const [data, total] = await Promise.all([
      databaseService.wsLists
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
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray(),
      databaseService.wsLists.countDocuments(matchStage)
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

  // 1) Khởi tạo chat cho user + practiceId, prompt lấy từ DB
  async wsInitChat(userId: string, practiceId: string): Promise<InitResult> {
    const prompt = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptWritingType.INITIALIZATION
    )
    const text = await resetAndInitSession(userId, practiceId, prompt)
    return JSON.parse(text as string)
  }

  // 2) Đánh giá từng câu
  async wsEvaluate(
    userId: string,
    practiceId: string,
    sentence_vi: string,
    user_translation: string
  ): Promise<EvaluateResult> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptWritingType.TRANSLATION
    )
    const prompt = fillTemplate(promptTpl, {
      sentence_vi,
      user_translation
    })
    const text = await sendInSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as EvaluateResult
  }

  // 3) Đánh giá tổng quan + kết thúc chat
  async wsComplete(
    userId: string,
    practiceId: string
  ): Promise<EvaluateResult> {
    const prompt = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptWritingType.COMPLETION
    )
    const text = await completeAndDeleteSession(userId, practiceId, prompt)
    return { Passed: true, Feedback_html: text as string }
  }

  // Xem trước chủ đề tạo bằng AI
  async wsPreviewCustomTopic(
    description_topic: string,
    description_level: string
  ): Promise<PreviewTopicWSResult> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_SENTENCE,
      PromptWritingType.PREVIEW_TOPIC
    )
    const prompt = fillTemplate(promptTpl, {
      description_topic,
      description_level
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as PreviewTopicWSResult
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
  ): Promise<InitResult> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptWritingType.INITIALIZATION
    )
    const prompt = fillTemplate(promptTpl, {
      wp_paragraph
    })
    const text = await resetAndInitSession(userId, practiceId, prompt)
    return JSON.parse(text as string)
  }

  async wpEvaluate(
    userId: string,
    practiceId: string,
    sentence_vi: string,
    user_translation: string
  ): Promise<EvaluateResult> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptWritingType.TRANSLATION
    )
    const prompt = fillTemplate(promptTpl, {
      sentence_vi,
      user_translation
    })
    const text = await sendInSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as EvaluateResult
  }

  async wpComplete(
    userId: string,
    practiceId: string
  ): Promise<EvaluateResult> {
    const prompt = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptWritingType.COMPLETION
    )
    const text = await completeAndDeleteSession(userId, practiceId, prompt)
    return { Passed: true, Feedback_html: text as string }
  }

  async wpPreviewCustomTopic(
    description_topic: string,
    description_level: string
  ): Promise<PreviewTopicWPResult> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptWritingType.PREVIEW_TOPIC
    )
    const prompt = fillTemplate(promptTpl, {
      description_topic,
      description_level
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as PreviewTopicWPResult
  }

  async wpPreviewContent(content: string): Promise<PreviewTopicWPResult> {
    const promptTpl = await loadPrompt(
      PromptFeature.WRITE_PARAGRAPH,
      PromptWritingType.PREVIEW_CONTENT
    )
    const prompt = fillTemplate(promptTpl, {
      content
    })
    const text = await sendMessageOnce(prompt)
    return JSON.parse(text as string) as PreviewTopicWPResult
  }
}

const writingService = new WritingService()
export default writingService
