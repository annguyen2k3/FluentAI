import { Router } from 'express'
import {
  getStatisticsReportingRevenueController,
  getStatisticsReportingUsersScoreController,
  getStatisticsReportingUsersController,
  renderStatisticsReportingRevenueController,
  renderStatisticsReportingUsersController,
  renderStatisticsReportingUsersScoreController
} from '~/controllers/admin/statistics-reporting.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const statisticsReportingRoutes = Router()

statisticsReportingRoutes.get(
  '/users-overview',
  requireAdminAuth,
  wrapRequestHandler(renderStatisticsReportingUsersController)
)

statisticsReportingRoutes.get(
  '/users-score',
  requireAdminAuth,
  wrapRequestHandler(renderStatisticsReportingUsersScoreController)
)

statisticsReportingRoutes.get(
  '/revenue',
  requireAdminAuth,
  wrapRequestHandler(renderStatisticsReportingRevenueController)
)

statisticsReportingRoutes.get(
  '/users-overview/data',
  requireAdminAuth,
  wrapRequestHandler(getStatisticsReportingUsersController)
)

statisticsReportingRoutes.get(
  '/users-score/data',
  requireAdminAuth,
  wrapRequestHandler(getStatisticsReportingUsersScoreController)
)

statisticsReportingRoutes.get(
  '/revenue/data',
  requireAdminAuth,
  wrapRequestHandler(getStatisticsReportingRevenueController)
)

export default statisticsReportingRoutes
