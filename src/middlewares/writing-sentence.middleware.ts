import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import {
  PROPERTY_MESSAGES,
  WRITING_SENTENCE_MESSAGES
} from '~/constants/message'
import { SLUG_REGEX } from '~/constants/regex'
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
            const ws = await databaseService.wsLists
              .aggregate([
                {
                  $match: {
                    slug: value
                  }
                },
                {
                  $lookup: {
                    from: 'topics',
                    localField: 'topic',
                    foreignField: '_id',
                    as: 'topic'
                  }
                },
                {
                  $unwind: '$topic'
                },
                {
                  $lookup: {
                    from: 'levels',
                    localField: 'level',
                    foreignField: '_id',
                    as: 'level'
                  }
                },
                {
                  $unwind: '$level'
                },
                {
                  $sort: {
                    pos: 1
                  }
                }
              ])
              .next()
            if (!ws) {
              const wsPreview = await databaseService.wsListPreviews.findOne({
                slug: value
              })
              if (wsPreview) {
                req.ws = wsPreview
                return true
              }
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
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.LEVEL_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
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
            const topic = await databaseService.topics.findOne({
              _id: new ObjectId(value)
            })
            if (!topic) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.TOPIC_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
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
            if (value) {
              const slug = await databaseService.wsLists.findOne({
                slug: value
              })
              if (slug) {
                throw new ErrorWithStatus(
                  WRITING_SENTENCE_MESSAGES.SLUG_EXISTS,
                  HttpStatus.BAD_REQUEST
                )
              }
              if (!SLUG_REGEX.test(value)) {
                throw new ErrorWithStatus(
                  WRITING_SENTENCE_MESSAGES.SLUG_INVALID,
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

export const updateWSListValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.ID_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const wsList = await databaseService.wsLists.findOne({
              _id: new ObjectId(value)
            })
            if (!wsList) {
              throw new ErrorWithStatus(
                WRITING_SENTENCE_MESSAGES.WS_LIST_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.wsList = wsList
            return true
          }
        }
      },
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
            const topic = await databaseService.topics.findOne({
              _id: new ObjectId(value)
            })
            if (!topic) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.TOPIC_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
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
        isInt: {
          errorMessage: WRITING_SENTENCE_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.SLUG_INVALID
        },
        isLength: {
          options: {
            min: 1
          },
          errorMessage: WRITING_SENTENCE_MESSAGES.SLUG_LENGTH
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const slug = await databaseService.wsLists.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (slug) {
              throw new ErrorWithStatus(
                WRITING_SENTENCE_MESSAGES.SLUG_EXISTS,
                HttpStatus.BAD_REQUEST
              )
            }
            if (!SLUG_REGEX.test(value)) {
              throw new ErrorWithStatus(
                WRITING_SENTENCE_MESSAGES.SLUG_INVALID,
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
