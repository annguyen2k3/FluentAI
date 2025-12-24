import { Admin, ObjectId } from 'mongodb'
import { Request, Response } from 'express'
import { databaseService } from '~/services/database.service'
import { UserStatus } from '~/constants/enum'
import { HttpStatus } from '~/constants/httpStatus'
import userService from '~/services/users.service'
import User from '~/models/schemas/users.schema'
import scoreService from '~/services/score.service'

const prefixAdmin = process.env.PREFIX_ADMIN

// GET /admin/users
export const renderManageUserController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const today = new Date()
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  )
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
          active: [
            { $match: { status: UserStatus.ACTIVE } },
            { $count: 'count' }
          ],
          blocked: [
            { $match: { status: UserStatus.BLOCKED } },
            { $count: 'count' }
          ],
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

  res.render('admin/pages/users/manage-users.pug', {
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
  const sort = (req.query.sort as string) || 'desc'
  const startDate = (req.query.startDate as string) || undefined
  const endDate = (req.query.endDate as string) || undefined

  let sortKey: 'create_at' | 'credit' | 'score' = 'create_at'
  let sortOrder: 'asc' | 'desc' = 'desc'

  if (sort === 'asc' || sort === 'desc') {
    sortKey = 'create_at'
    sortOrder = sort
  } else if (sort === 'credit_asc' || sort === 'credit_desc') {
    sortKey = 'credit'
    sortOrder = sort === 'credit_asc' ? 'asc' : 'desc'
  } else if (sort === 'score_asc' || sort === 'score_desc') {
    sortKey = 'score'
    sortOrder = sort === 'score_asc' ? 'asc' : 'desc'
  }

  const result = await userService.getListUsers({
    page,
    limit,
    status,
    search,
    sortKey,
    sortOrder,
    startDate,
    endDate
  })

  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Get list of users successfully',
    data: result
  })
}

// GET /admin/users/score/:userId
export const renderManageUserScoreController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin

  const userId = req.params.userId
  const user = await userService.getUserById(userId)
  if (!user) {
    res.render('admin/pages/404.pug', {
      pageTitle: 'Admin - 404',
      admin,
      prefixAdmin
    })
    return
  }

  const now = new Date()
  const year = Number(req.query.year) || now.getFullYear()
  const month = Number(req.query.month) || now.getMonth() + 1

  const userMonthlyScore = await scoreService.getUserMonthlyScore(
    user._id as ObjectId,
    year,
    month
  )

  res.render('admin/pages/users/score.pug', {
    pageTitle: 'Admin - Quản lý điểm số người dùng',
    admin,
    prefixAdmin,
    user,
    userMonthlyScore
  })
}

// GET /admin/users/wallet/:userId
export const renderManageUserWalletController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const userId = req.params.userId
  const user = await userService.getUserById(userId)
  if (!user) {
    res.render('admin/pages/404.pug', {
      pageTitle: 'Admin - 404',
      admin,
      prefixAdmin
    })
    return
  }

  const wallet = await userService.getDetailWallet(user.wallet?._id as string)
  res.render('admin/pages/users/wallet.pug', {
    pageTitle: 'Admin - Quản lý ví người dùng',
    admin,
    prefixAdmin,
    user,
    wallet
  })
}

// PATCH /admin/users/wallet/edit
export const editWalletUserController = async (req: Request, res: Response) => {
  const { userId, amount, titleMail, htmlDescriptionMail } = req.body
  const result = await userService.editWalletUser(
    userId,
    amount,
    titleMail,
    htmlDescriptionMail
  )
  if (!result.success) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: result.message
    })
    return
  }
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cập nhật ví người dùng thành công'
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
    databaseService.hisPracticeUsers.deleteMany({ userId: user._id }),
    databaseService.hisSSUsers.deleteMany({ userId: user._id }),
    databaseService.wallets.deleteOne({ _id: user.wallet }),
    databaseService.refreshTokens.deleteMany({ user_id: user._id })
  ])
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Xóa tài khoản thành công'
  })
}

// PUT /admin/users/update
export const updateUserManageController = async (
  req: Request,
  res: Response
) => {
  const user = req.user as User
  const { username, email, dateOfBirth, phoneNumber, gender } = req.body
  await userService.updateUserManage(
    user._id?.toString() || '',
    username,
    email,
    dateOfBirth,
    phoneNumber,
    gender
  )
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cập nhật thông tin người dùng thành công'
  })
}
