import { Admin, ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { databaseService } from '~/services/database.service'
import { UserStatus } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import userService from '~/services/users.service'
import User from '~/models/schemas/users.schema'

const prefixAdmin = process.env.PREFIX_ADMIN

// GET /admin/users
export const renderManageUserController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  )

  const [stats] = await databaseService.users
    .aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: UserStatus.ACTIVE } }, { $count: 'count' }],
          blocked: [{ $match: { status: UserStatus.BLOCKED } }, { $count: 'count' }],
          newUsers: [
            { $match: { create_at: { $gte: startOfToday, $lte: endOfToday } } },
            { $count: 'count' }
          ]
        }
      }
    ])
    .toArray()

  const countUsers = stats.total[0]?.count || 0
  const countActiveUsers = stats.active[0]?.count || 0
  const countBlockedUsers = stats.blocked[0]?.count || 0
  const countNewUsers = stats.newUsers[0]?.count || 0

  res.render('admin/pages/manage-users.pug', {
    pageTitle: 'Admin - Quản lý người dùng',
    admin,
    prefixAdmin,
    countUsers,
    countActiveUsers,
    countBlockedUsers,
    countNewUsers
  })
}

// GET /admin/users/list
export const getListUsersController = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const status = (req.query.status as UserStatus) || ''
  const search = (req.query.search as string) || ''
  const sort = (req.query.sort as 'asc' | 'desc') || 'desc'
  const startDate = (req.query.startDate as string) || undefined
  const endDate = (req.query.endDate as string) || undefined

  const result = await userService.getListUsers({
    page,
    limit,
    status,
    search,
    sort,
    startDate,
    endDate
  })

  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Get list of users successfully',
    data: result
  })
}

// POST /admin/users/lock
export const lockUserController = async (req: Request, res: Response) => {
  const user = req.user as User
  await userService.lockUser(user._id?.toString() || '')
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Khoá tài khoản thành công'
  })
}

// POST /admin/users/unlock
export const unlockUserController = async (req: Request, res: Response) => {
  const user = req.user as User
  await userService.unlockUser(user._id?.toString() || '')
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Mở khóa tài khoản thành công'
  })
}

// POST /admin/users/logout
export const logoutUserController = async (req: Request, res: Response) => {
  const user = req.user as User

  await databaseService.refreshTokens.deleteMany({ user_id: user._id })

  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Đăng xuất người dùng thành công.'
  })
}

// DELETE /admin/users/delete
export const deleteUserController = async (req: Request, res: Response) => {
  const user = req.user as User

  if (user.status === UserStatus.ACTIVE) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Không thể xóa tài khoản đang hoạt động'
    })
    return
  }

  await Promise.all([
    databaseService.users.deleteOne({ _id: user._id }),
    databaseService.refreshTokens.deleteMany({ user_id: user._id })
  ])
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Xóa tài khoản thành công'
  })
}
