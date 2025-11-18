import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { CATEGORIES_MESSAGES } from '~/constants/message'
import { databaseService } from '~/services/database.service'
import { validate } from '~/utils/validation'

export const createCategoriesValidator = validate(
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
            const level = await databaseService.levels.findOne({ slug: value })
            if (level) {
              throw new Error(CATEGORIES_MESSAGES.SLUG_EXISTS)
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

export const updateCategoriesValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({ _id: new ObjectId(value) })
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
        optional: true,
        isString: {
          errorMessage: CATEGORIES_MESSAGES.SLUG_INVALID
        },
        trim: true,
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

export const deleteCategoriesValidator = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: async (value, { req }) => {
            const level = await databaseService.levels.findOne({ _id: new ObjectId(value) })
            if (!level) {
              throw new Error(CATEGORIES_MESSAGES.LEVEL_NOT_FOUND)
            }
          }
        }
      }
    },
    ['body']
  )
)
