import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { unset } from 'lodash'
import { ObjectId } from 'mongodb'
import adminServices from '~/services/admin.services'
import { databaseService } from '~/services/database.service'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'
import { USER_MESSAGES } from '~/constants/message'
import Admin from '~/models/schemas/admin.schema'
import md5 from 'md5'

const prefixAdmin = process.env.PREFIX_ADMIN

const ADMIN_USERNAME_REGEX = /^[a-zA-Z0-9]+$/

export const requireAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const access_token = req.cookies?.access_token as string
  const refresh_token = req.cookies?.refresh_token as string

  if (!access_token || !refresh_token) {
    return res.redirect(prefixAdmin + '/auth/login')
  }

  const refresh_token_exists = await databaseService.refreshTokens.findOne({ token: refresh_token })
  if (refresh_token_exists === null) {
    return res.redirect(prefixAdmin + '/auth/login')
  }

  try {
    const decoded = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    const admin = await databaseService.admins.findOne({ _id: new ObjectId(decoded.user_id) })
    if (!admin) {
      return res.redirect(prefixAdmin + '/auth/login')
    }
    unset(admin, 'password')
    req.admin = admin
    next()
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      try {
        const decoded = await verifyToken({
          token: refresh_token,
          secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
        })

        const admin = await databaseService.admins.findOne({ _id: new ObjectId(decoded.user_id) })
        if (!admin) {
          return res.redirect(prefixAdmin + '/auth/login')
        }
        unset(admin, 'password')

        req.admin = admin
        const new_tokens = await adminServices.login(admin._id.toString())
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
        return res.redirect(prefixAdmin + '/auth/login')
      }
    }
    return res.redirect(prefixAdmin + '/auth/login')
  }
}

export const updateProfileValidator = validate(
  checkSchema(
    {
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
            const admin = req.admin as Admin
            const existingAdmin = await databaseService.admins.findOne({
              username: value,
              _id: { $ne: new ObjectId(admin._id) }
            })
            if (existingAdmin) {
              throw new Error(USER_MESSAGES.USERNAME_EXISTS)
            }

            if (!ADMIN_USERNAME_REGEX.test(value)) {
              throw new Error('Tên tài khoản chỉ được chứa chữ cái và số')
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
            const admin = req.admin as Admin
            const existingAdmin = await databaseService.admins.findOne({
              email: value,
              _id: { $ne: new ObjectId(admin._id) }
            })
            if (existingAdmin) {
              throw new Error(USER_MESSAGES.EMAIL_EXISTS)
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
      currentPassword: {
        custom: {
          options: async (value, { req }) => {
            const admin = req.admin as Admin
            const isCorrectPassword = await databaseService.admins.findOne({
              _id: new ObjectId(admin._id),
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
