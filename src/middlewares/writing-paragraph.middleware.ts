import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import {
  PROPERTY_MESSAGES,
  WRITING_SENTENCE_MESSAGES
} from '~/constants/message'
import { SLUG_REGEX } from '~/constants/regex'
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
      type: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({ slug: value })
            if (!type) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.TYPE_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
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
      type: {
        optional: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({ slug: value })
            if (!type) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.TYPE_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
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
            const topic = await databaseService.topics.findOne({ slug: value })
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
            const wp = await databaseService.wpParagraphs
              .aggregate([
                {
                  $match: { slug: value }
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
                    from: 'types',
                    localField: 'type',
                    foreignField: '_id',
                    as: 'type'
                  }
                },
                {
                  $unwind: '$type'
                }
              ])
              .next()

            if (!wp) {
              const wpPreview = await databaseService.wpPreviews.findOne({
                slug: value
              })
              if (!wpPreview) {
                throw new ErrorWithStatus(
                  PROPERTY_MESSAGES.SLUG_NOT_FOUND,
                  HttpStatus.NOT_FOUND
                )
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
  })
)

export const createWPListValidator = validate(
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
      type: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.TYPE_NOT_FOUND
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({
              _id: new ObjectId(value)
            })
            if (!type) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.TYPE_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.type = type
            return true
          }
        }
      },
      content: {
        isString: {
          errorMessage: 'Nội dung đoạn văn không hợp lệ'
        },
        trim: true
      },
      hint: {
        optional: true,
        isArray: {
          errorMessage: 'Gợi ý từ vựng không hợp lệ'
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
              const slug = await databaseService.wpParagraphs.findOne({
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

export const updateWPListValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: WRITING_SENTENCE_MESSAGES.ID_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const wpParagraph = await databaseService.wpParagraphs.findOne({
              _id: new ObjectId(value)
            })
            if (!wpParagraph) {
              throw new ErrorWithStatus(
                'Nội dung viết đoạn văn không tồn tại',
                HttpStatus.NOT_FOUND
              )
            }
            req.wpParagraph = wpParagraph
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
      type: {
        isString: {
          errorMessage: PROPERTY_MESSAGES.TYPE_NOT_FOUND
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({
              _id: new ObjectId(value)
            })
            if (!type) {
              throw new ErrorWithStatus(
                PROPERTY_MESSAGES.TYPE_NOT_FOUND,
                HttpStatus.NOT_FOUND
              )
            }
            req.type = type
            return true
          }
        }
      },
      content: {
        isString: {
          errorMessage: 'Nội dung đoạn văn không hợp lệ'
        },
        trim: true
      },
      hint: {
        optional: true,
        isArray: {
          errorMessage: 'Gợi ý từ vựng không hợp lệ'
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
            const slug = await databaseService.wpParagraphs.findOne({
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
