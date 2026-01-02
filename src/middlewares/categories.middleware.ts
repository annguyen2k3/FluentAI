import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { CATEGORIES_MESSAGES, PROPERTY_MESSAGES } from '~/constants/message'
import { SLUG_REGEX } from '~/constants/regex'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

export const createLevelValidator = validate(
  checkSchema(
    {
      title: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      description: {
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_LENGTH
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_INVALID
        },
        trim: true
      },
      fa_class_icon: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        isLength: {
          options: {
            min: 0,
            max: 20
          },
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) return true
            const level = await databaseService.levels.findOne({ slug: value })
            if (level) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
            }
            if (!SLUG_REGEX.test(value)) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_INVALID)
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: CATEGORIES_MESSAGES.POS_INVALID
        },
        toInt: true,
        custom: {
          options: (value, { req }) => {
            if (value < 1) {
              throw new Error(CATEGORIES_MESSAGES.POS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateLevelValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({
              _id: new ObjectId(value)
            })
            if (!level) {
              throw new Error(CATEGORIES_MESSAGES.LEVEL_NOT_FOUND)
            }
          }
        }
      },
      title: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      description: {
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_LENGTH
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_INVALID
        },
        trim: true
      },
      fa_class_icon: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        isLength: {
          options: {
            min: 0,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.SLUG_LENGTH
        },
        custom: {
          options: async (value, { req }) => {
            if (!value) return true
            const existingLevel = await databaseService.levels.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (existingLevel) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
            }
            if (!SLUG_REGEX.test(value)) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_INVALID)
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: CATEGORIES_MESSAGES.POS_INVALID
        },
        toInt: true,
        custom: {
          options: async (value, { req }) => {
            if (value < 1) {
              throw new Error(CATEGORIES_MESSAGES.POS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const deleteLevelValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({
              _id: new ObjectId(value)
            })
            if (!level) {
              throw new Error(CATEGORIES_MESSAGES.LEVEL_NOT_FOUND)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const createTypeValidator = validate(
  checkSchema(
    {
      title: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      description: {
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_LENGTH
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_INVALID
        },
        trim: true
      },
      fa_class_icon: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        isLength: {
          options: {
            min: 0,
            max: 20
          },
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) return true
            const type = await databaseService.types.findOne({ slug: value })
            if (type) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
            }
            if (!SLUG_REGEX.test(value)) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_INVALID)
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: CATEGORIES_MESSAGES.POS_INVALID
        },
        toInt: true,
        custom: {
          options: (value, { req }) => {
            if (value < 1) {
              throw new Error(CATEGORIES_MESSAGES.POS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateTypeValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({
              _id: new ObjectId(value)
            })
            if (!type) {
              throw new Error(CATEGORIES_MESSAGES.TYPE_NOT_FOUND)
            }
          }
        }
      },
      title: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      description: {
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_LENGTH
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_INVALID
        },
        trim: true
      },
      fa_class_icon: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        isLength: {
          options: {
            min: 0,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.SLUG_LENGTH
        },
        custom: {
          options: async (value, { req }) => {
            if (!value) return true
            const existingType = await databaseService.types.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (existingType) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
            }
            if (!SLUG_REGEX.test(value)) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_INVALID)
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: CATEGORIES_MESSAGES.POS_INVALID
        },
        toInt: true,
        custom: {
          options: (value, { req }) => {
            if (value < 1) {
              throw new Error(CATEGORIES_MESSAGES.POS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const deleteTypeValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const type = await databaseService.types.findOne({
              _id: new ObjectId(value)
            })
            if (!type) {
              throw new Error(CATEGORIES_MESSAGES.TYPE_NOT_FOUND)
            }
          }
        }
      }
    },
    ['body']
  )
)

export const createTopicValidator = validate(
  checkSchema(
    {
      title: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      description: {
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_LENGTH
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_INVALID
        },
        trim: true
      },
      fa_class_icon: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        isLength: {
          options: {
            min: 0,
            max: 20
          },
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        trim: true
      },
      slug: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) return true
            const topic = await databaseService.topics.findOne({ slug: value })
            if (topic) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
            }
            if (!SLUG_REGEX.test(value)) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_INVALID)
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: CATEGORIES_MESSAGES.POS_INVALID
        },
        toInt: true,
        custom: {
          options: (value, { req }) => {
            if (value < 1) {
              throw new Error(CATEGORIES_MESSAGES.POS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateTopicValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const topic = await databaseService.topics.findOne({
              _id: new ObjectId(value)
            })
            if (!topic) {
              throw new Error(CATEGORIES_MESSAGES.TOPIC_NOT_FOUND)
            }
          }
        }
      },
      title: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.TITLE_INVALID
        },
        trim: true
      },
      description: {
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_LENGTH
        },
        isString: {
          errorMessage: CATEGORIES_MESSAGES.DESCRIPTION_INVALID
        },
        trim: true
      },
      fa_class_icon: {
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        isLength: {
          options: {
            min: 0,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.FA_CLASS_ICON_INVALID
        },
        trim: true
      },
      slug: {
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: CATEGORIES_MESSAGES.SLUG_LENGTH
        },
        custom: {
          options: async (value, { req }) => {
            if (!value) return true
            const existingTopic = await databaseService.topics.findOne({
              slug: value,
              _id: { $ne: new ObjectId(req.body.id) }
            })
            if (existingTopic) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
            }
            if (!SLUG_REGEX.test(value)) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_INVALID)
            }
            return true
          }
        }
      },
      pos: {
        optional: true,
        isInt: {
          errorMessage: CATEGORIES_MESSAGES.POS_INVALID
        },
        toInt: true,
        custom: {
          options: (value, { req }) => {
            if (value < 1) {
              throw new Error(CATEGORIES_MESSAGES.POS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const deleteTopicValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const topic = await databaseService.topics.findOne({
              _id: new ObjectId(value)
            })
            if (!topic) {
              throw new Error(CATEGORIES_MESSAGES.TOPIC_NOT_FOUND)
            }
          }
        }
      }
    },
    ['body']
  )
)
