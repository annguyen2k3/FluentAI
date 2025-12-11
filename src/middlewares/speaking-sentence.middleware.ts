import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import {
  PROPERTY_MESSAGES,
  SPEAKING_SENTENCE_MESSAGES
} from '~/constants/message'
import { SLUG_REGEX } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { SentenceSpeakingType } from '~/models/schemas/ss-list.schema'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

export const createSSListValidator = validate(
  checkSchema(
    {
      title: {
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      topic: {
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.TOPIC_INVALID
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
          errorMessage: SPEAKING_SENTENCE_MESSAGES.LIST_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const checkList = value.every((item: SentenceSpeakingType) => {
              return (
                typeof item.pos === 'number' &&
                typeof item.enSentence === 'string' &&
                typeof item.viSentence === 'string' &&
                (!item.phonetics || typeof item.phonetics === 'string') &&
                (!item.audioUrl || typeof item.audioUrl === 'string')
              )
            })
            if (!checkList) {
              throw new ErrorWithStatus(
                SPEAKING_SENTENCE_MESSAGES.LIST_INVALID,
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
          errorMessage: SPEAKING_SENTENCE_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (value) {
              const slug = await databaseService.ssLists.findOne({
                slug: value
              })
              if (slug) {
                throw new ErrorWithStatus(
                  SPEAKING_SENTENCE_MESSAGES.SLUG_EXISTS,
                  HttpStatus.BAD_REQUEST
                )
              }
              if (!SLUG_REGEX.test(value)) {
                throw new ErrorWithStatus(
                  SPEAKING_SENTENCE_MESSAGES.SLUG_INVALID,
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

export const updateSSListValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.ID_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const ssList = await databaseService.ssLists.findOne({
              _id: new ObjectId(value)
            })
            if (!ssList) {
              throw new ErrorWithStatus(
                SPEAKING_SENTENCE_MESSAGES.SS_LIST_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.ssList = ssList
            return true
          }
        }
      },
      title: {
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      topic: {
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.TOPIC_INVALID
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
          errorMessage: SPEAKING_SENTENCE_MESSAGES.LIST_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const checkList = value.every((item: SentenceSpeakingType) => {
              return (
                typeof item.pos === 'number' &&
                typeof item.enSentence === 'string' &&
                typeof item.viSentence === 'string' &&
                (!item.phonetics || typeof item.phonetics === 'string') &&
                (!item.audioUrl || typeof item.audioUrl === 'string')
              )
            })
            if (!checkList) {
              throw new ErrorWithStatus(
                SPEAKING_SENTENCE_MESSAGES.LIST_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      pos: {
        isInt: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: SPEAKING_SENTENCE_MESSAGES.SLUG_INVALID
        },
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: SPEAKING_SENTENCE_MESSAGES.SLUG_LENGTH
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const slug = await databaseService.ssLists.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (slug) {
              throw new ErrorWithStatus(
                SPEAKING_SENTENCE_MESSAGES.SLUG_EXISTS,
                HttpStatus.BAD_REQUEST
              )
            }
            if (!SLUG_REGEX.test(value)) {
              throw new ErrorWithStatus(
                SPEAKING_SENTENCE_MESSAGES.SLUG_INVALID,
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
