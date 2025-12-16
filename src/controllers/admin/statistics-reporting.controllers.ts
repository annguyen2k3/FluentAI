import { Request, Response } from 'express'
import { Admin } from 'mongodb'
import {
  getUsersOverviewService,
  UsersOverviewParams
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
