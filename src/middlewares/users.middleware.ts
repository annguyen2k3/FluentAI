import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, omit, unset } from 'lodash'
import md5 from 'md5'
import { ObjectId } from 'mongodb'
import { GenderType, UserStatus, VerifyEmailType } from '~/constants/enum'
import { PROPERTY_MESSAGES, USER_MESSAGES } from '~/constants/message'
import { PHONE_NUMBER_REGEX, USERNAME_REGEX } from '~/constants/regex'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'
import userService from '~/services/users.service'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExists = await userService.checkEmailExists(value)
            if (!isExists) {
              throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
            }

            return true
          }
        }
      },
      password: {
        isLength: {
          options: {
            min: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: req.body.email,
              password: md5(value)
            })
            if (user === null) {
              throw new Error(USER_MESSAGES.PASSWORD_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExists = await userService.checkEmailExists(value)
            if (isExists) {
              throw new Error(USER_MESSAGES.EMAIL_EXISTS)
            }

            return true
          }
        }
      },
      password: {
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_STRONG
        }
      },
      passwordConfirm: {
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.PASSWORD_NOT_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailValidator = validate(
  checkSchema(
    {
      otp: {
        isLength: {
          options: {
            min: 4,
            max: 4
          },
          errorMessage: USER_MESSAGES.OTP_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const email = req.cookies?.emailRegister as string
            const otp = await databaseService.otpVerifyEmail.findOne({
              email,
              otp: value,
              type: VerifyEmailType.RESISTER
            })
            if (!otp) {
              throw new Error(USER_MESSAGES.OTP_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordEmailValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExists = await userService.checkEmailExists(value)
            if (!isExists) {
              throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordOTPValidator = validate(
  checkSchema(
    {
      otp: {
        isLength: {
          options: {
            min: 4,
            max: 4
          },
          errorMessage: USER_MESSAGES.OTP_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const email = req.cookies?.emailForgotPassword as string
            const otp = await databaseService.otpVerifyEmail.findOne({
              email,
              otp: value,
              type: VerifyEmailType.FORGOT_PASSWORD
            })
            if (!otp) {
              throw new Error(USER_MESSAGES.OTP_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordResetValidator = validate(
  checkSchema(
    {
      password: {
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_STRONG
        }
      },
      passwordConfirm: {
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USER_MESSAGES.PASSWORD_NOT_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const access_token = req.cookies?.access_token as string
  const refresh_token = req.cookies?.refresh_token as string

  if (!access_token || !refresh_token) {
    return res.redirect('/users/login')
  }

  const refresh_token_exists = await databaseService.refreshTokens.findOne({
    token: refresh_token
  })
  if (refresh_token_exists === null) {
    return res.redirect('/users/login')
  }

  try {
    const decoded = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    const user = await userService.getUserById(decoded.user_id)
    if (!user || user.status === UserStatus.BLOCKED) {
      return res.redirect('/users/login')
    }
    unset(user, 'password')
    req.user = user as User
    next()
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      try {
        const decoded = await verifyToken({
          token: refresh_token,
          secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })

        const user = await userService.getUserById(decoded.user_id)
        if (!user) {
          return res.redirect('/users/login')
        }
        unset(user, 'password')

        req.user = user
        const new_tokens = await userService.login(user._id.toString())
        res.cookie('access_token', new_tokens.access_token, {
          httpOnly: true,
          sameSite: 'lax'
        })
        res.cookie('refresh_token', new_tokens.refresh_token, {
          httpOnly: true,
          sameSite: 'lax'
        })
        return next()
      } catch (error) {
        return res.redirect('/users/login')
      }
    }
    return res.redirect('/users/login')
  }
}

export const updateProfileValidator = validate(
  checkSchema(
    {
      userId: {
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
          }
        }
      },
      username: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USER_MESSAGES.USERNAME_LENGTH
        },
        custom: {
          options: async (value, { req }) => {
            const isExists = await userService.checkUsernameExists(
              value,
              req.user?._id.toString()
            )
            if (isExists) {
              throw new Error(USER_MESSAGES.USERNAME_EXISTS)
            }
            if (!USERNAME_REGEX.test(value)) {
              throw new Error(USER_MESSAGES.USERNAME_INVALID)
            }
            return true
          }
        }
      },
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const isExists = await userService.checkEmailExists(
              value,
              req.user?._id.toString()
            )
            if (isExists) {
              throw new Error(USER_MESSAGES.EMAIL_EXISTS)
            }
            return true
          }
        }
      },
      dateOfBirth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USER_MESSAGES.DATE_OF_BIRTH_INVALID
        },
        custom: {
          options: (value, { req }) => {
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) {
              throw new Error(USER_MESSAGES.DATE_OF_BIRTH_INVALID)
            }
            const min = new Date('1900-01-01T00:00:00.000Z')
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (d < min || d > today) {
              throw new Error(USER_MESSAGES.DATE_OF_BIRTH_INVALID)
            }
            return true
          }
        }
      },
      phoneNumber: {
        custom: {
          options: (value, { req }) => {
            if (!PHONE_NUMBER_REGEX.test(value)) {
              throw new Error(USER_MESSAGES.PHONE_NUMBER_INVALID)
            }
            return true
          }
        }
      },
      gender: {
        custom: {
          options: (value, { req }) => {
            if (!Object.values(GenderType).includes(value as GenderType)) {
              throw new Error(USER_MESSAGES.GENDER_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      oldPassword: {
        custom: {
          options: async (value, { req }) => {
            const user = req.user as User
            const isCorrectPassword = await databaseService.users.findOne({
              _id: new ObjectId(user._id),
              password: md5(value)
            })
            if (isCorrectPassword === null) {
              throw new Error(USER_MESSAGES.PASSWORD_INCORRECT)
            }
            return true
          }
        }
      },
      newPassword: {
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_STRONG
        }
      },
      confirmPassword: {
        custom: {
          options: (value, { req }) => {
            console.log(value, req.body.newPassword)
            if (value !== req.body.newPassword) {
              throw new Error(USER_MESSAGES.PASSWORD_NOT_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getListValidator = validate(
  checkSchema(
    {
      page: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: async (value, { req }) => {
            if (!value || value === '') return true
            const page = Number(value)
            if (Number.isNaN(page) || page < 1) {
              throw new Error(PROPERTY_MESSAGES.PAGE_INVALID)
            }
            return true
          }
        }
      },
      limit: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: async (value, { req }) => {
            if (!value || value === '') return true
            const limit = Number(value)
            if (Number.isNaN(limit) || limit < 1) {
              throw new Error(PROPERTY_MESSAGES.LIMIT_INVALID)
            }
            return true
          }
        }
      },
      status: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: async (value, { req }) => {
            if (!value || value === '') return true
            if (!Object.values(UserStatus).includes(value as UserStatus)) {
              throw new Error(PROPERTY_MESSAGES.STATUS_INVALID)
            }
            return true
          }
        }
      },
      search: {
        optional: { options: { values: 'falsy' } },
        isString: {
          errorMessage: PROPERTY_MESSAGES.SEARCH_INVALID
        }
      },
      sort: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: async (value, { req }) => {
            if (!value || value === '') return true
            if (!['asc', 'desc'].includes(value)) {
              throw new Error(PROPERTY_MESSAGES.SORT_INVALID)
            }
            return true
          }
        }
      },
      startDate: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: async (value, { req }) => {
            if (!value || value === '') return true
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(value)) {
              throw new Error(PROPERTY_MESSAGES.DATE_INVALID)
            }
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              throw new Error(PROPERTY_MESSAGES.DATE_INVALID)
            }
            return true
          }
        }
      },
      endDate: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: async (value, { req }) => {
            if (!value || value === '') return true
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(value)) {
              throw new Error(PROPERTY_MESSAGES.DATE_INVALID)
            }
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              throw new Error(PROPERTY_MESSAGES.DATE_INVALID)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const userIdExistsValidator = validate(
  checkSchema(
    {
      userId: {
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateUserManageValidator = validate(
  checkSchema(
    {
      userId: {
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      },
      username: {
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USER_MESSAGES.USERNAME_LENGTH
        },
        custom: {
          options: async (value, { req }) => {
            const isExists = await userService.checkUsernameExists(
              value,
              req.body.userId.toString()
            )
            if (isExists) {
              throw new Error(USER_MESSAGES.USERNAME_EXISTS)
            }

            if (!USERNAME_REGEX.test(value)) {
              throw new Error(USER_MESSAGES.USERNAME_INVALID)
            }
            return true
          }
        }
      },
      dateOfBirth: {
        optional: { options: { values: 'falsy' } },
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USER_MESSAGES.DATE_OF_BIRTH_INVALID
        },
        custom: {
          options: (value, { req }) => {
            const d = new Date(value)
            if (Number.isNaN(d.getTime())) {
              throw new Error(USER_MESSAGES.DATE_OF_BIRTH_INVALID)
            }
            const min = new Date('1900-01-01T00:00:00.000Z')
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (d < min || d > today) {
              throw new Error(USER_MESSAGES.DATE_OF_BIRTH_INVALID)
            }
            return true
          }
        }
      },
      phoneNumber: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: (value, { req }) => {
            if (!PHONE_NUMBER_REGEX.test(value)) {
              throw new Error(USER_MESSAGES.PHONE_NUMBER_INVALID)
            }
            return true
          }
        }
      },
      gender: {
        optional: { options: { values: 'falsy' } },
        custom: {
          options: (value, { req }) => {
            if (!Object.values(GenderType).includes(value as GenderType)) {
              throw new Error(USER_MESSAGES.GENDER_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
