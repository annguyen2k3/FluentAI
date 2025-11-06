import { Request, Response } from 'express'
import md5 from 'md5'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import { COMMON_MESSAGES, USER_MESSAGES } from '~/constants/message'
import User from '~/models/schemas/users.schema'
import userService from '~/services/users.service'
import {ParamsDictionary} from "express-serve-static-core";
import { LoginReqBody, RegisterReqBody, UpdateProfileReqBody, VerifyEmailReqBody, ForgotPasswordEmailReqBody, ForgotPasswordOTPReqBody, ForgotPasswordResetReqBody, ChangePasswordReqBody } from '~/models/requests/User.request'
import { GenderType, VerifyEmailType } from '~/constants/enum'
import { databaseService } from '~/services/database.service'
import { omit } from 'lodash'
import mediasService from '~/services/medias.service'
import { deleteFileFromS3 } from '~/utils/s3'

// GET /users/login
export const getLoginController = (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', { pageTitle: 'FluentAI - Đăng nhập' })
}

// GET /users/logout
export const logoutController = async (req: Request, res: Response) => {
  res.clearCookie('refresh_token')
  res.clearCookie('access_token')
  res.redirect('/users/login')
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

// GET /users/google/start
export const googleOAuthStartController = async (req: Request, res: Response) => {
  const url = await userService.getGooogleAuthUrl()
  return res.redirect(url)
}

// GET /users/google/callback
export const googleOAuthCallbackController = async (req: Request, res: Response) => {
  const code = String(req.query.code || '')
  if (!code) return res.status(HttpStatus.BAD_REQUEST).send('Missing code')

  const result = await userService.oauth(code)

  // ví dụ: set cookie refresh_token HttpOnly và chuyển hướng về trang chủ
  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
  })
  res.cookie('access_token', result.access_token, {
    httpOnly: true,
    sameSite: 'lax',
  })

  // có thể đính kèm access_token vào query hoặc trả JSON; ở đây redirect
  return res.redirect(`/`)
}

// GET /users/register
export const getRegisterController = (req: Request, res: Response) => {
  res.render('client/pages/auth/register.pug', { pageTitle: 'FluentAI - Đăng ký' })
}

// POST /users/register
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
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
export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
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
export const forgotPasswordEmailController = async (req: Request<ParamsDictionary, any, ForgotPasswordEmailReqBody>, res: Response) => {
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
export const forgotPasswordOTPController = async (req: Request<ParamsDictionary, any, ForgotPasswordOTPReqBody>, res: Response) => {

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
export const forgotPasswordResetController = async (req: Request<ParamsDictionary, any, ForgotPasswordResetReqBody>, res: Response) => {

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

// GET /users/profile
export const getProfileController = async (req: Request, res: Response) => {
  const user = req.user as User

  const returnUser = omit(user, ['password'])

  res.render('client/pages/users/profile.pug', { pageTitle: 'FluentAI - Thông tin cá nhân', user: returnUser })
}

// PUT /users/profile
export const updateProfileController = async (req: Request, res: Response) => {
  const user = req.user as User
  const newInfo = req.body as UpdateProfileReqBody

  await userService.updateProfile(user._id?.toString() as string, newInfo.username, new Date(newInfo.dateOfBirth), newInfo.phoneNumber, newInfo.gender)

  const newUser = await databaseService.users.findOne({ _id: new ObjectId(user._id) })

  const returnUser = omit(newUser, ['password'])


  res.status(HttpStatus.OK).json({
    message: COMMON_MESSAGES.INFORM_SUCCESS,
    status: HttpStatus.OK,
    user: returnUser
  })
}

// PUT /users/profile/change-password
export const changePasswordController = async (req: Request<ParamsDictionary, any, ChangePasswordReqBody>, res: Response) => {
  const user = req.user as User
  const newPassword = req.body.newPassword

  await userService.changePassword(user._id?.toString() as string, newPassword)

  res.status(HttpStatus.OK).json({
    message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS,
    status: HttpStatus.OK
  })
}

// PATCH /users/profile/avatar
export const updateAvatarProfileController = async (req: Request, res: Response) => {
  const user = req.user as User

  const result = await mediasService.uploadImage(req)

  Promise.all([
    deleteFileFromS3({ filename: user.avatar as string }),
    databaseService.users.updateOne({ _id: new ObjectId(user._id) }, { $set: { avatar: result[0].url } })
  ])

  res.status(HttpStatus.OK).json({
    message: USER_MESSAGES.UPDATE_AVATAR_SUCCESS,
    status: HttpStatus.OK,
    avatar_url: result[0].url
  })
}