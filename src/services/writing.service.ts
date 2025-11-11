import { ObjectId } from "mongodb"
import { databaseService } from "./database.service"
import { config } from "dotenv"
import { resetAndInitSession, sendInSession, completeAndDeleteSession } from '~/utils/gemini'
import { PromptFeature, PromptWritingType } from "~/constants/enum"
import { ErrorWithStatus } from "~/models/Errors"
import { HttpStatus } from "~/constants/httpStatus"
config()

type EvaluateResult = { Passed: boolean; Feedback_html: string }
type InitResult = { Init_success: boolean }

function sk(userId: string, practiceId: string) {
  return `${userId}_${practiceId}`
}

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return Object.keys(vars).reduce((s, k) => s.replaceAll(`{{${k}}}`, vars[k]), tpl)
}

async function loadPrompt(feature: PromptFeature, writingType: PromptWritingType) {
  const doc = await databaseService.prompts.findOne({
    feature: feature,
    writing_type: writingType,
    status: true
  })
  if (!doc?.content) throw new ErrorWithStatus(`Prompt not found: ${writingType}`, HttpStatus.NOT_FOUND)
  return doc.content
}

class WritingService {
  async getWSList(find: {level?: ObjectId, topic?: ObjectId, page?: number, limit?: number}) {   
    const { page = 1, limit = 10, ...matchQuery } = find
    const skip = (page - 1) * limit
    const matchStage: any = {}
    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic

    const [data, total] = await Promise.all([
      databaseService.wsLists.aggregate([
        { $match: matchStage },
        { $sort: { pos: 1 } },
        { $lookup: { from: 'levels', localField: 'level', foreignField: '_id', as: 'level' } },
        { $unwind: '$level' },
        { $lookup: { from: 'topics', localField: 'topic', foreignField: '_id', as: 'topic' } },
        { $unwind: '$topic' },
        { $skip: skip },
        { $limit: limit }
      ]).toArray(),
      databaseService.wsLists.countDocuments(matchStage)
    ])

    const totalPages = Math.ceil(total / limit)
    return {
      data,
      pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    }
  }

  // 1) Khởi tạo chat cho user + practiceId, prompt lấy từ DB
  async wsInitChat(userId: string, practiceId: string): Promise<InitResult> {
    const prompt = await loadPrompt(PromptFeature.WRITE_SENTENCE, PromptWritingType.INITIALIZATION)
    const text = await resetAndInitSession(userId, practiceId, prompt)
    return JSON.parse(text as string)
  }

  // 2) Đánh giá từng câu
  async wsEvaluate(userId: string, practiceId: string, sentence_vi: string, user_translation: string): Promise<EvaluateResult> {
    const promptTpl = await loadPrompt(PromptFeature.WRITE_SENTENCE, PromptWritingType.TRANSLATION)
    const prompt = fillTemplate(promptTpl, {
      sentence_vi,
      user_translation
    })
    const text = await sendInSession(userId, practiceId, prompt)
    return JSON.parse(text as string) as EvaluateResult
  }

  // 3) Đánh giá tổng quan + kết thúc chat
  async wsComplete(userId: string, practiceId: string): Promise<EvaluateResult> {
    const prompt = await loadPrompt(PromptFeature.WRITE_SENTENCE, PromptWritingType.COMPLETION)
    const text = await completeAndDeleteSession(userId, practiceId, prompt)
    return { Passed: true, Feedback_html: text as string }
  }

  // // 4) Xem trước chủ đề tạo bằng AI
  // async wsPreviewCustomTopic(userId: string, topic: string): Promise<string> {}
}

const writingService = new WritingService()
export default writingService