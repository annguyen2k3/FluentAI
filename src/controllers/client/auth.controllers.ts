import { Request, Response } from 'express'
import { HttpStatus } from '~/constants/httpStatus'
import { USER_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { databaseService } from '~/services/database.service'

export const getLoginController = (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', { pageTitle: 'FluentAI - Đăng nhập' })
}

export const loginController = async (req: Request, res: Response) => {
  const email = req.body.email
  const password = req.body.password

  throw new ErrorWithStatus(USER_MESSAGE.LOGIN_FAILED, HttpStatus.FORBIDDEN)
}
