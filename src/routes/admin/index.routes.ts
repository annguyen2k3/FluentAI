import { Express, Request, Response } from 'express'
import authRoutes from './auth.routes'
import { Admin } from 'mongodb'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { databaseService } from '~/services/database.service'
import manageUserRoutes from './manage-user.routes'
import manageCategoryRoutes from './manage-category.routes'
import manageWsRoutes from './manage-ws.routes'
import manageWpRoutes from './manage-wp.routes'
import manageSsRoutes from './manage-ss.routes'
import manageSshRoutes from './manage-ssh.routes'
import manageLvRoutes from './manage-lv.routes'

export default function (app: Express) {
  const prefixAdmin = process.env.PREFIX_ADMIN

  app.use(prefixAdmin + '/auth', authRoutes)

  // GET /admin/dashboard
  app.get(
    prefixAdmin + '/dashboard',
    requireAdminAuth,
    async function (req: Request, res: Response) {
      const admin = req.admin as Admin
      const countUsers = await databaseService.users.countDocuments()
      res.render('admin/pages/dashboard.pug', {
        pageTitle: 'Admin - Dashboard',
        admin,
        countUsers
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
}
