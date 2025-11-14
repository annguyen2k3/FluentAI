import { Request, Response, NextFunction } from 'express'
import { unset } from 'lodash'
import { Admin, ObjectId } from 'mongodb'
import adminServices from '~/services/admin.services'
import { databaseService } from '~/services/database.service'
import { verifyToken } from '~/utils/jwt'

const prefixAdmin = process.env.PREFIX_ADMIN

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
