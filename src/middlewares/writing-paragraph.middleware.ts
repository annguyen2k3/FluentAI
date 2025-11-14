import { checkSchema } from 'express-validator'
import { HttpStatus } from '~/constants/httpStatus'
import { PROPERTY_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

export const getSystemListWPValidator = validate(
  checkSchema(
    {
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
      },
      type: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({ slug: value })
            if (!type) {
              throw new ErrorWithStatus(PROPERTY_MESSAGES.TYPE_NOT_FOUND, HttpStatus.NOT_FOUND)
            }
            req.type = type
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const getListWPValidator = validate(
  checkSchema(
    {
      level: {
        optional: true,
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
      },
      type: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({ slug: value })
            if (!type) {
              throw new ErrorWithStatus(PROPERTY_MESSAGES.TYPE_NOT_FOUND, HttpStatus.NOT_FOUND)
            }
            req.type = type
            return true
          }
        }
      },
      topic: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            console.log('value', value)
            const topic = await databaseService.topics.findOne({ slug: value })
            if (!topic) {
              throw new ErrorWithStatus(PROPERTY_MESSAGES.TOPIC_NOT_FOUND, HttpStatus.NOT_FOUND)
            }
            req.topic = topic
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const renderWPPraticeValidator = validate(
  checkSchema(
    {
      slug: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const wp = await databaseService.wpParagraphs.findOne({ slug: value })
            if (!wp) {
              const wpPreview = await databaseService.wpPreviews.findOne({ slug: value })
              if (!wpPreview) {
                throw new ErrorWithStatus(PROPERTY_MESSAGES.SLUG_NOT_FOUND, HttpStatus.NOT_FOUND)
              }
              req.wp = wpPreview
              return true
            }
            req.wp = wp
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const postCustomTopicPreviewWPValidator = validate(
  checkSchema({
    topic: {
      isString: {
        errorMessage: PROPERTY_MESSAGES.TOPIC_INVALID
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
  })
)
