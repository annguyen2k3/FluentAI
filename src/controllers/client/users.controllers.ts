import { Request, Response } from 'express'
import md5 from 'md5'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { COMMON_MESSAGES, USER_MESSAGES } from '~/constants/message'
import User from '~/models/schemas/users.schema'
import userService from '~/services/users.service'
import {ParamsDictionary} from "express-serve-static-core";
import { LoginReqBody } from '~/models/requests/User.request'
import { VerifyEmailType } from '~/constants/enum'
import { databaseService } from '~/services/database.service'

// GET /users/login
export const getLoginController = (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', { pageTitle: 'FluentAI - Đăng nhập' })
}

// POST /users/login
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId

  const result = await userService.login(user_id.toString())

  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
  })
  res.cookie('access_token', result.access_token, {
    httpOnly: true,
    sameSite: 'lax',
  })

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

// POST /users/verify-email
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

// GET /users/forgot-password
export const getForgotPasswordController = (req: Request, res: Response) => {
  res.render('client/pages/auth/forgot-password.pug', { pageTitle: 'FluentAI - Quên mật khẩu' })
}

// POST /users/forgot-password/email
export const forgotPasswordEmailController = async (req: Request, res: Response) => {
  const { email } = req.body

  res.cookie('emailForgotPassword', email)

  res.status(HttpStatus.OK).json({
    message: COMMON_MESSAGES.INFORM_SUCCESS,
    status: HttpStatus.OK,
  })
}

// GET /users/forgot-password/otp
export const getForgotPasswordOTPController = async (req: Request, res: Response) => {

  const email = req.cookies.emailForgotPassword as string

  if (!email) {
    return res.redirect('/users/forgot-password')
  }

  await userService.sendOTPVerifyEmail(email, VerifyEmailType.FORGOT_PASSWORD)

  res.render('client/pages/auth/forgot-password-otp.pug', { pageTitle: 'FluentAI - Quên mật khẩu OTP' })
}

// POST /users/forgot-password/otp
export const forgotPasswordOTPController = async (req: Request, res: Response) => {

  const otp = req.body.otp
  res.cookie('otpForgotPassword', otp)

  res.status(HttpStatus.OK).json({
    message: COMMON_MESSAGES.INFORM_SUCCESS,
    status: HttpStatus.OK,
  })
}

// GET /users/forgot-password/reset
export const getForgotPasswordResetController = async (req: Request, res: Response) => {

  const otp = req.cookies.otpForgotPassword as string
  const email = req.cookies.emailForgotPassword as string

  const check = await databaseService.otpVerifyEmail.findOne({ email, otp, type: VerifyEmailType.FORGOT_PASSWORD })
  if (!check) {
    return res.redirect('/users/forgot-password')
  }

  res.render('client/pages/auth/forgot-password-reset.pug', { pageTitle: 'FluentAI - Đặt lại mật khẩu' })
}

// POST /users/forgot-password/reset
export const forgotPasswordResetController = async (req: Request, res: Response) => {

  const email = req.cookies.emailForgotPassword as string
  const password = req.body.password

  await userService.resetPassword(email, password)

  res.clearCookie('emailForgotPassword')
  res.clearCookie('otpForgotPassword')

  res.status(HttpStatus.OK).json({
    message: USER_MESSAGES.RESET_PASSWORD_SUCCESS,
    status: HttpStatus.OK
  })
}
