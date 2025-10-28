import { Request, Response } from 'express'
import md5 from 'md5'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { COMMON_MESSAGES, USER_MESSAGES } from '~/constants/message'
import User from '~/models/schemas/users.schema'
import userService from '~/services/users.service'
import {ParamsDictionary} from "express-serve-static-core";
import { LoginReqBody } from '~/models/requests/User.request'
import { generateOTP } from '~/utils/random'
import { VerifyEmailType } from '~/constants/enum'

// GET /users/login
export const getLoginController = (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', { pageTitle: 'FluentAI - Đăng nhập' })
}

// POST /users/login
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await userService.login(user_id.toString())

  res.cookie('refresh_token', result.refresh_token)
  res.cookie('access_token', result.access_token)

  res.status(HttpStatus.OK).json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    status: HttpStatus.OK,
  })
}

export const googleOAuthStartController = async (req: Request, res: Response) => {
  const url = await userService.getGooogleAuthUrl()
  return res.redirect(url)
}

export const googleOAuthCallbackController = async (req: Request, res: Response) => {
  const code = String(req.query.code || '')
  if (!code) return res.status(HttpStatus.BAD_REQUEST).send('Missing code')

  const result = await userService.oauth(code)

  // ví dụ: set cookie refresh_token HttpOnly và chuyển hướng về trang chủ
  res.cookie('refresh_token', result.refresh_token)

  // có thể đính kèm access_token vào query hoặc trả JSON; ở đây redirect
  return res.redirect(`/?login=success`)
}

// GET /users/register
export const getRegisterController = (req: Request, res: Response) => {
  res.render('client/pages/auth/register.pug', { pageTitle: 'FluentAI - Đăng ký' })
}

// POST /users/register
export const registerController = async (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    message: COMMON_MESSAGES.INFORM_SUCCESS,
    status: HttpStatus.OK,
  })
}

// GET /users/verify-email
export const getVerifyEmailController = async (req: Request, res: Response) => {
  const email = req.cookies.emailRegister as string
  const password = req.cookies.passwordRegister as string

  await userService.sendOTPVerifyEmail(email, VerifyEmailType.RESISTER)

  res.render('client/pages/auth/verify-email.pug', 
    { 
      pageTitle: 'FluentAI - Xác thực email',
      email: email
    })  
}

export const verifyEmailController = async (req: Request, res: Response) => {
  const email = req.cookies.emailRegister as string
  const password = req.cookies.passwordRegister as string

  const result = await userService.register(email, password)

  res.clearCookie('emailRegister')
  res.clearCookie('passwordRegister')

  res.cookie('refresh_token', result.refresh_token)
  res.cookie('access_token', result.access_token)

  res.status(HttpStatus.OK).json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    status: HttpStatus.OK,
  })
}