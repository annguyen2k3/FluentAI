import { checkSchema } from "express-validator"
import { ObjectId } from "mongodb"
import { HttpStatus } from "~/constants/httpStatus"
import { PROPERTY_MESSAGES, WRITING_SENTENCE_MESSAGES } from "~/constants/message"
import { ErrorWithStatus } from "~/models/Errors"
import { databaseService } from "~/services/database.service"
import { validate } from "~/utils/validation"

export const renderWSPraticeValidator = validate(checkSchema({
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
}, ['params']))

export const postPracticeWSValidator = validate(checkSchema({
    sentence_vi: {
        isString: {
            errorMessage: WRITING_SENTENCE_MESSAGES.SENTENCE_VI_INVALID
        },
        trim: true,
    },
    user_translation: {
        isString: {
            errorMessage: WRITING_SENTENCE_MESSAGES.USER_TRANSLATION_INVALID
        },
        trim: true,
    }
}, ['body']))

export const postCustomTopicPreviewWSValidator = validate(checkSchema({
    topic: {
        isString: {
            errorMessage: WRITING_SENTENCE_MESSAGES.TOPIC_INVALID
        },
        trim: true,
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
}, ['body']))
