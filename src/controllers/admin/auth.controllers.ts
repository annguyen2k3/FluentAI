import { Request, Response } from 'express'
import md5 from 'md5'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import adminServices from '~/services/admin.service'
import { databaseService } from '~/services/database.service'
import mediasService from '~/services/medias.service'
import { deleteFileFromS3 } from '~/utils/s3'
import Admin from '~/models/schemas/admin.schema'
import { omit } from 'lodash'

const prefixAdmin = process.env.PREFIX_ADMIN

// GET /admin/auth/login
export const getLoginController = async (req: Request, res: Response) => {
  res.render('admin/pages/auth/login.pug', { pageTitle: 'Admin - Đăng nhập' })
}

// POST /admin/auth/login
export const loginController = async (req: Request, res: Response) => {
  const { username, password } = req.body
  const admin = await databaseService.admins.findOne({
    username,
    password: md5(password)
  })
  if (!admin) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Sai tên đăng nhập hoặc mật khẩu',
      status: HttpStatus.UNAUTHORIZED
    })
  }
  const result = await adminServices.login(admin._id.toString())
  res.cookie('refresh_token', result.refresh_token, {
    httpOnly: true,
    sameSite: 'lax'
  })
  res.cookie('access_token', result.access_token, {
    httpOnly: true,
    sameSite: 'lax'
  })
  res.status(HttpStatus.OK).json({
    message: 'Đăng nhập thành công',
    status: HttpStatus.OK
  })
}

// GET /admin/auth/logout
export const logoutController = async (req: Request, res: Response) => {
  res.clearCookie('refresh_token')
  res.clearCookie('access_token')
  res.redirect(prefixAdmin + '/auth/login')
}

// GET /admin/auth/profile
export const getProfileController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  res.render('admin/pages/auth/profile.pug', {
    pageTitle: 'Admin - Thông tin cá nhân',
    admin: admin
  })
}

// PUT /admin/auth/profile
export const updateProfileController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { username, email } = req.body

  await databaseService.admins.updateOne(
    { _id: new ObjectId(admin._id) },
    { $set: { username, email, update_at: new Date() } }
  )

  const updatedAdmin = await databaseService.admins.findOne({
    _id: new ObjectId(admin._id)
  })
  const returnAdmin = omit(updatedAdmin, ['password'])

  res.status(HttpStatus.OK).json({
    message: 'Cập nhật thông tin thành công',
    status: HttpStatus.OK,
    admin: returnAdmin
  })
}

// PUT /admin/auth/profile/change-password
export const changePasswordController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const newPassword = req.body.newPassword

  const passwordHash = md5(newPassword)
  await databaseService.admins.updateOne(
    { _id: new ObjectId(admin._id) },
    { $set: { password: passwordHash, update_at: new Date() } }
  )

  res.status(HttpStatus.OK).json({
    message: 'Đổi mật khẩu thành công',
    status: HttpStatus.OK
  })
}

// PATCH /admin/auth/profile/avatar
export const updateAvatarProfileController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin

  const result = await mediasService.uploadImage(req)

  await Promise.all([
    deleteFileFromS3({ filename: admin.avatar as string }),
    databaseService.admins.updateOne(
      { _id: new ObjectId(admin._id) },
      { $set: { avatar: result[0].url } }
    )
  ])

  res.status(HttpStatus.OK).json({
    message: 'Cập nhật ảnh đại diện thành công',
    status: HttpStatus.OK,
    avatar_url: result[0].url
  })
}
