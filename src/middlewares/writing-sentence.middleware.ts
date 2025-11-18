import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { PROPERTY_MESSAGES, WRITING_SENTENCE_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { SentenceWriteType } from '~/models/schemas/ws-list.schema'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

export const renderWSPraticeValidator = validate(
  checkSchema(
    {
      slug: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const ws = await databaseService.wsLists.findOne({ slug: value })
            if (!ws) {
              const wsPreview = await databaseService.wsListPreviews.findOne({ slug: value })
              if (!wsPreview) {
                throw new ErrorWithStatus(PROPERTY_MESSAGES.SLUG_NOT_FOUND, HttpStatus.NOT_FOUND)
              }
              req.ws = wsPreview
              return true
            }
            req.ws = ws
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const postPracticeWSValidator = validate(
  checkSchema(
    {
      sentence_vi: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.SENTENCE_VI_INVALID
        },
        trim: true
      },
      user_translation: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.USER_TRANSLATION_INVALID
        },
        trim: true
      }
    },
    ['body']
  )
)

export const postCustomTopicPreviewWSValidator = validate(
  checkSchema(
    {
      topic: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.TOPIC_INVALID
        },
        trim: true
      },
      level: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({ slug: value })
            if (!level) {
              throw new ErrorWithStatus(PROPERTY_MESSAGES.LEVEL_NOT_FOUND, HttpStatus.NOT_FOUND)
            }
            req.level = level
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const createWSListValidator = validate(
  checkSchema(
    {
      title: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      topic: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.TOPIC_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const topic = await databaseService.topics.findOne({ _id: new ObjectId(value) })
            if (!topic) {
              throw new ErrorWithStatus(PROPERTY_MESSAGES.TOPIC_NOT_FOUND, HttpStatus.NOT_FOUND)
            }
            req.topic = topic
            return true
          }
        }
      },
      level: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.LEVEL_NOT_FOUND
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({ _id: new ObjectId(value) })
            if (!level) {
              throw new ErrorWithStatus(PROPERTY_MESSAGES.LEVEL_NOT_FOUND, HttpStatus.NOT_FOUND)
            }
            req.level = level
            return true
          }
        }
      },
      list: {
        isArray: {
          errorMessage: WRITING_SENTENCE_MESSAGES.LIST_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const checkList = value.every((item: SentenceWriteType) => {
              return (
                typeof item.pos === 'number' &&
                typeof item.content === 'string' &&
                (!item.hint || Array.isArray(item.hint))
              )
            })
            if (!checkList) {
              throw new ErrorWithStatus(
                WRITING_SENTENCE_MESSAGES.LIST_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: WRITING_SENTENCE_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const slug = await databaseService.wsLists.findOne({ slug: value })
            if (slug) {
              throw new ErrorWithStatus(
                WRITING_SENTENCE_MESSAGES.SLUG_EXISTS,
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
