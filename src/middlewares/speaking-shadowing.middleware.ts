import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import {
  PROPERTY_MESSAGES,
  SPEAKING_SHADOWING_MESSAGES
} from '~/constants/message'
import { SLUG_REGEX } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Errors'
import { ShadowingSentenceType } from '~/models/schemas/sv-shadowing.schema'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

export const createSVListValidator = validate(
  checkSchema(
    {
      title: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      topic: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.TOPIC_INVALID
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
      videoUrl: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.VIDEO_URL_INVALID
        },
        trim: true,
        notEmpty: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.VIDEO_URL_REQUIRED
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
          errorMessage: SPEAKING_SHADOWING_MESSAGES.TRANSCRIPT_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.TRANSCRIPT_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            const checkTranscript = value.every(
              (item: ShadowingSentenceType) => {
                return (
                  typeof item.startTime === 'number' &&
                  typeof item.endTime === 'number' &&
                  typeof item.enText === 'string' &&
                  item.enText.trim().length > 0 &&
                  typeof item.viText === 'string' &&
                  item.viText.trim().length > 0 &&
                  item.startTime >= 0 &&
                  item.endTime > item.startTime &&
                  (!item.phonetics || typeof item.phonetics === 'string')
                )
              }
            )
            if (!checkTranscript) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.TRANSCRIPT_INVALID,
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
          errorMessage: SPEAKING_SHADOWING_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (value) {
              const slug = await databaseService.svShadowings.findOne({
                slug: value
              })
              if (slug) {
                throw new ErrorWithStatus(
                  SPEAKING_SHADOWING_MESSAGES.SLUG_EXISTS,
                  HttpStatus.BAD_REQUEST
                )
              }
              if (!SLUG_REGEX.test(value)) {
                throw new ErrorWithStatus(
                  SPEAKING_SHADOWING_MESSAGES.SLUG_INVALID,
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

export const updateSVListValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.ID_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const svShadowing = await databaseService.svShadowings.findOne({
              _id: new ObjectId(value)
            })
            if (!svShadowing) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.SV_SHADOWING_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.svShadowing = svShadowing
            return true
          }
        }
      },
      title: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      topic: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.TOPIC_INVALID
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
      videoUrl: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.VIDEO_URL_INVALID
        },
        trim: true,
        notEmpty: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.VIDEO_URL_REQUIRED
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
          errorMessage: SPEAKING_SHADOWING_MESSAGES.TRANSCRIPT_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.TRANSCRIPT_REQUIRED,
                HttpStatus.BAD_REQUEST
              )
            }
            const checkTranscript = value.every(
              (item: ShadowingSentenceType) => {
                return (
                  typeof item.startTime === 'number' &&
                  typeof item.endTime === 'number' &&
                  typeof item.enText === 'string' &&
                  item.enText.trim().length > 0 &&
                  typeof item.viText === 'string' &&
                  item.viText.trim().length > 0 &&
                  item.startTime >= 0 &&
                  item.endTime > item.startTime &&
                  (!item.phonetics || typeof item.phonetics === 'string')
                )
              }
            )
            if (!checkTranscript) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.TRANSCRIPT_INVALID,
                HttpStatus.BAD_REQUEST
              )
            }
            return true
          }
        }
      },
      pos: {
        isInt: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.POS_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: SPEAKING_SHADOWING_MESSAGES.SLUG_INVALID
        },
        isLength: {
          options: {
            min: 1
          },
          errorMessage: SPEAKING_SHADOWING_MESSAGES.SLUG_LENGTH
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const slug = await databaseService.svShadowings.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (slug) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.SLUG_EXISTS,
                HttpStatus.BAD_REQUEST
              )
            }
            if (!SLUG_REGEX.test(value)) {
              throw new ErrorWithStatus(
                SPEAKING_SHADOWING_MESSAGES.SLUG_INVALID,
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
