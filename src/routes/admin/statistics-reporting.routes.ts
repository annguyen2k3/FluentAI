import { Router } from 'express'
import {
  getStatisticsReportingUsersScoreController,
  getStatisticsReportingUsersController,
  renderStatisticsReportingUsersController,
  renderStatisticsReportingUsersScoreController
} from '~/controllers/admin/statistics-reporting.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const statisticsReportingRoutes = Router()

// GET /admin/statistics-reporting/users
// Description: Render page statistics reporting users
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

// GET /admin/statistics-reporting/users-overview/data
// Description: Get statistics overview users
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

export default statisticsReportingRoutes
