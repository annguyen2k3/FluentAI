import { Request, Response } from 'express'
import { Admin } from 'mongodb'
import {
  getUsersOverviewService,
  getUsersScoreStatisticsService,
  UsersOverviewParams,
  UsersScoreParams
} from '~/services/statistics-reporting.service'

export const renderStatisticsReportingUsersController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  res.render('admin/pages/statistics-reporting/users-overview.pug', {
    pageTitle: 'Admin - Thống kê người dùng hệ thống',
    admin
  })
}

export const renderStatisticsReportingUsersScoreController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  res.render('admin/pages/statistics-reporting/users-score.pug', {
    pageTitle: 'Admin - Thống kê điểm số và hoạt động người dùng',
    admin
  })
}

export const getStatisticsReportingUsersController = async (
  req: Request,
  res: Response
) => {
  const {
    type = 'all',
    startDate = '',
    endDate = ''
  } = req.query as Partial<UsersOverviewParams>
  const data = await getUsersOverviewService({
    type: type as UsersOverviewParams['type'],
    startDate,
    endDate
  })
  res.json(data)
}

export const getStatisticsReportingUsersScoreController = async (
  req: Request,
  res: Response
) => {
  const { startDate = '', endDate = '' } =
    req.query as Partial<UsersScoreParams>

  const data = await getUsersScoreStatisticsService({
    startDate,
    endDate
  })

  res.json(data)
}
