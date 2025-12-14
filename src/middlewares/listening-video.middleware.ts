import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { PROPERTY_MESSAGES } from '~/constants/message'
import { SLUG_REGEX } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import {
  TranscriptSentenceType,
  QuestionType
} from '~/models/schemas/lv-video.schemas'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

const LISTENING_VIDEO_MESSAGES = {
  ID_INVALID: 'ID không hợp lệ',
  LV_NOT_FOUND: 'Bài nghe video không tồn tại',
  TITLE_INVALID: 'Tiêu đề không hợp lệ',
  TOPIC_INVALID: 'Chủ đề không hợp lệ',
  LEVEL_INVALID: 'Cấp độ không hợp lệ',
  TRANSCRIPT_INVALID: 'Transcript không hợp lệ',
  TRANSCRIPT_REQUIRED: 'Vui lòng thêm ít nhất một câu transcript',
  QUESTIONS_INVALID: 'Câu hỏi không hợp lệ',
  QUESTIONS_REQUIRED: 'Vui lòng thêm ít nhất một câu hỏi',
  VIDEO_URL_INVALID: 'URL video không hợp lệ',
  VIDEO_URL_REQUIRED: 'URL video là bắt buộc',
  POS_INVALID: 'Vị trí không hợp lệ',
  SLUG_INVALID:
    'Slug không hợp lệ. Chỉ được chứa chữ cái, số, dấu gạch dưới ( _ ) và dấu gạch ngang ( - )',
  SLUG_EXISTS: 'Slug đã tồn tại',
  SLUG_LENGTH: 'Slug phải có ít nhất 1 ký tự',
  TOPICS_REQUIRED: 'Vui lòng chọn ít nhất một chủ đề'
} as const

export const createLVListValidator = validate(
  checkSchema(
    {
      title: {
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      level: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.LEVEL_NOT_FOUND
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({
              _id: new ObjectId(value)
            })
            if (!level) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.LEVEL_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.level = level
            return true
          }
        }
      },
      topics: {
        isArray: {
          errorMessage: LISTENING_VIDEO_MESSAGES.TOPIC_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.TOPICS_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            for (const topicId of value) {
              const topic = await databaseService.topics.findOne({
                _id: new ObjectId(topicId)
              })
              if (!topic) {
                throw new ErrorWithStatus(
                  PROPERTY_MESSAGES.TOPIC_NOT_FOUND,
                  HttpStatus.NOT_FOUND
                )
              }
            }
            return true
          }
        }
      },
      videoUrl: {
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.VIDEO_URL_INVALID
        },
        trim: true,
        notEmpty: {
          errorMessage: LISTENING_VIDEO_MESSAGES.VIDEO_URL_REQUIRED
        }
      },
      thumbnailUrl: {
        optional: true,
        isString: {
          errorMessage: 'URL thumbnail không hợp lệ'
        },
        trim: true
      },
      transcript: {
        isArray: {
          errorMessage: LISTENING_VIDEO_MESSAGES.TRANSCRIPT_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.TRANSCRIPT_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            const checkTranscript = value.every(
              (item: TranscriptSentenceType) => {
                return (
                  typeof item.pos === 'number' &&
                  typeof item.startTime === 'number' &&
                  typeof item.endTime === 'number' &&
                  typeof item.enText === 'string' &&
                  item.enText.trim().length > 0 &&
                  item.startTime >= 0 &&
                  item.endTime > item.startTime &&
                  (!item.viText || typeof item.viText === 'string')
                )
              }
            )
            if (!checkTranscript) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.TRANSCRIPT_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      questions: {
        isArray: {
          errorMessage: LISTENING_VIDEO_MESSAGES.QUESTIONS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.QUESTIONS_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            const checkQuestions = value.every((item: QuestionType) => {
              return (
                typeof item.pos === 'number' &&
                typeof item.question === 'string' &&
                item.question.trim().length > 0 &&
                typeof item.options === 'object' &&
                typeof item.options.A === 'string' &&
                item.options.A.trim().length > 0 &&
                typeof item.options.B === 'string' &&
                item.options.B.trim().length > 0 &&
                typeof item.options.C === 'string' &&
                item.options.C.trim().length > 0 &&
                typeof item.options.D === 'string' &&
                item.options.D.trim().length > 0 &&
                ['A', 'B', 'C', 'D'].includes(item.answer) &&
                (!item.explanation || typeof item.explanation === 'string')
              )
            })
            if (!checkQuestions) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.QUESTIONS_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      time: {
        optional: true,
        isFloat: {
          errorMessage: 'Thời lượng không hợp lệ'
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: 'Mô tả không hợp lệ'
        },
        trim: true
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: LISTENING_VIDEO_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (value) {
              const slug = await databaseService.listeningVideos.findOne({
                slug: value
              })
              if (slug) {
                throw new ErrorWithStatus(
                  LISTENING_VIDEO_MESSAGES.SLUG_EXISTS,
                  HttpStatus.BAD_REQUEST
                )
              }
              if (!SLUG_REGEX.test(value)) {
                throw new ErrorWithStatus(
                  LISTENING_VIDEO_MESSAGES.SLUG_INVALID,
                  HttpStatus.BAD_REQUEST
                )
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateLVListValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.ID_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const lv = await databaseService.listeningVideos.findOne({
              _id: new ObjectId(value)
            })
            if (!lv) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.LV_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.lv = lv
            return true
          }
        }
      },
      title: {
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      level: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.LEVEL_NOT_FOUND
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({
              _id: new ObjectId(value)
            })
            if (!level) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.LEVEL_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.level = level
            return true
          }
        }
      },
      topics: {
        isArray: {
          errorMessage: LISTENING_VIDEO_MESSAGES.TOPIC_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.TOPICS_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            for (const topicId of value) {
              const topic = await databaseService.topics.findOne({
                _id: new ObjectId(topicId)
              })
              if (!topic) {
                throw new ErrorWithStatus(
                  PROPERTY_MESSAGES.TOPIC_NOT_FOUND,
                  HttpStatus.NOT_FOUND
                )
              }
            }
            return true
          }
        }
      },
      videoUrl: {
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.VIDEO_URL_INVALID
        },
        trim: true,
        notEmpty: {
          errorMessage: LISTENING_VIDEO_MESSAGES.VIDEO_URL_REQUIRED
        }
      },
      thumbnailUrl: {
        optional: true,
        isString: {
          errorMessage: 'URL thumbnail không hợp lệ'
        },
        trim: true
      },
      transcript: {
        isArray: {
          errorMessage: LISTENING_VIDEO_MESSAGES.TRANSCRIPT_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.TRANSCRIPT_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            const checkTranscript = value.every(
              (item: TranscriptSentenceType) => {
                return (
                  typeof item.pos === 'number' &&
                  typeof item.startTime === 'number' &&
                  typeof item.endTime === 'number' &&
                  typeof item.enText === 'string' &&
                  item.enText.trim().length > 0 &&
                  item.startTime >= 0 &&
                  item.endTime > item.startTime &&
                  (!item.viText || typeof item.viText === 'string')
                )
              }
            )
            if (!checkTranscript) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.TRANSCRIPT_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      questions: {
        isArray: {
          errorMessage: LISTENING_VIDEO_MESSAGES.QUESTIONS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.QUESTIONS_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            const checkQuestions = value.every((item: QuestionType) => {
              return (
                typeof item.pos === 'number' &&
                typeof item.question === 'string' &&
                item.question.trim().length > 0 &&
                typeof item.options === 'object' &&
                typeof item.options.A === 'string' &&
                item.options.A.trim().length > 0 &&
                typeof item.options.B === 'string' &&
                item.options.B.trim().length > 0 &&
                typeof item.options.C === 'string' &&
                item.options.C.trim().length > 0 &&
                typeof item.options.D === 'string' &&
                item.options.D.trim().length > 0 &&
                ['A', 'B', 'C', 'D'].includes(item.answer) &&
                (!item.explanation || typeof item.explanation === 'string')
              )
            })
            if (!checkQuestions) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.QUESTIONS_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      time: {
        optional: true,
        isFloat: {
          errorMessage: 'Thời lượng không hợp lệ'
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: 'Mô tả không hợp lệ'
        },
        trim: true
      },
      pos: {
        isInt: {
          errorMessage: LISTENING_VIDEO_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: LISTENING_VIDEO_MESSAGES.SLUG_INVALID
        },
        isLength: {
          options: {
            min: 1
          },
          errorMessage: LISTENING_VIDEO_MESSAGES.SLUG_LENGTH
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const slug = await databaseService.listeningVideos.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (slug) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.SLUG_EXISTS,
                HttpStatus.BAD_REQUEST
              )
            }
            if (!SLUG_REGEX.test(value)) {
              throw new ErrorWithStatus(
                LISTENING_VIDEO_MESSAGES.SLUG_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
