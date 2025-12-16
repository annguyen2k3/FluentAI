import { Router } from 'express'
import {
  getStatisticsReportingGoogleApiController,
  getStatisticsReportingRevenueController,
  getStatisticsReportingUsersScoreController,
  getStatisticsReportingUsersController,
  renderStatisticsReportingGoogleApiController,
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
  '/google-api',
  requireAdminAuth,
  wrapRequestHandler(renderStatisticsReportingGoogleApiController)
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

statisticsReportingRoutes.get(
  '/google-api/data',
  requireAdminAuth,
  wrapRequestHandler(getStatisticsReportingGoogleApiController)
)

export default statisticsReportingRoutes
