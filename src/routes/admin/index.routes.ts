import { Express, Request, Response } from 'express'
import authRoutes from './auth.routes'
import { Admin } from 'mongodb'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import manageUserRoutes from './manage-user.routes'
import manageCategoryRoutes from './manage-category.routes'
import manageWsRoutes from './manage-ws.routes'
import manageWpRoutes from './manage-wp.routes'
import manageSsRoutes from './manage-ss.routes'
import manageSshRoutes from './manage-ssh.routes'
import manageLvRoutes from './manage-lv.routes'
import configSystemRoutes from './config-system.routes'
import aiLLMRoutes from './ai-llm.routes'
import statisticsReportingRoutes from './statistics-reporting.routes'
import {
  getGoogleApiRequestStatisticsService,
  getRevenueStatisticsService,
  getUsersOverviewService,
  getUsersScoreStatisticsService
} from '~/services/statistics-reporting.service'
import infoWebsiteRoutes from './info-website.routes'

export default function (app: Express) {
  const prefixAdmin = process.env.PREFIX_ADMIN

  app.use(prefixAdmin + '/auth', authRoutes)

  // GET /admin/dashboard
  app.get(
    prefixAdmin + '/dashboard',
    requireAdminAuth,
    async function (req: Request, res: Response) {
      const admin = req.admin as Admin

      const today = new Date()
      const start = new Date(today)
      start.setDate(start.getDate() - 6)

      const toDateInput = (d: Date) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const toLabelDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
      }

      const startDate = toDateInput(start)
      const endDate = toDateInput(today)
      const todayLabel = toLabelDate(today)

      const [usersOverview, usersScore, revenue, googleApi] = await Promise.all(
        [
          getUsersOverviewService({ type: 'new', startDate, endDate }),
          getUsersScoreStatisticsService({ startDate, endDate }),
          getRevenueStatisticsService({ startDate, endDate }),
          getGoogleApiRequestStatisticsService({ startDate, endDate })
        ]
      )

      const usersToday =
        usersOverview.stats.find((item) => item.date === todayLabel)
          ?.newUsers ?? 0

      const usersScoreToday =
        usersScore.stats.find((item) => item.date === todayLabel)?.totalScore ??
        0

      const revenueToday =
        revenue.stats.find((item) => item.date === todayLabel)?.totalIncome ?? 0

      const googleApiTodayStat = googleApi.stats.find(
        (item) => item.date === todayLabel
      )

      const apiSuccessToday = (googleApiTodayStat?.services || []).reduce(
        (sum, svc) => sum + (svc.success200 || 0),
        0
      )

      const newUsersChart = {
        labels: usersOverview.stats.map((item) => item.date),
        data: usersOverview.stats.map((item) => item.newUsers)
      }

      const apiUsageChart = {
        labels: googleApi.stats.map((item) => item.date),
        data: googleApi.stats.map((item) =>
          (item.services || []).reduce(
            (sum, svc) => sum + (svc.success200 || 0),
            0
          )
        )
      }

      res.render('admin/pages/dashboard.pug', {
        pageTitle: 'Admin - Dashboard',
        admin,
        dashboardSummary: {
          newUsersToday: usersToday,
          usersScoreToday,
          revenueToday,
          apiSuccessToday
        },
        newUsersChart,
        apiUsageChart
      })
    }
  )

  app.use(prefixAdmin + '/users', manageUserRoutes)

  app.use(prefixAdmin + '/categories', manageCategoryRoutes)

  app.use(prefixAdmin + '/ws', manageWsRoutes)

  app.use(prefixAdmin + '/wp', manageWpRoutes)

  app.use(prefixAdmin + '/speaking-sentence', manageSsRoutes)

  app.use(prefixAdmin + '/speaking-shadowing', manageSshRoutes)

  app.use(prefixAdmin + '/listening-video', manageLvRoutes)

  app.use(prefixAdmin + '/configs', configSystemRoutes)

  app.use(prefixAdmin + '/ai-llm', aiLLMRoutes)

  app.use(prefixAdmin + '/statistics-reporting', statisticsReportingRoutes)

  app.use(prefixAdmin + '/info-website', infoWebsiteRoutes)
}
