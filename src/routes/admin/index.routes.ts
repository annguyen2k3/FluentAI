import { Express, Request, Response } from 'express'
import authRoutes from './auth.routes'
import { Admin } from 'mongodb'
import { requireAdminAuth } from '~/middlewares/admin.middleware'

export default function (app: Express) {
  const prefixAdmin = process.env.PREFIX_ADMIN

  app.use(prefixAdmin + '/auth', authRoutes)

  // GET /admin/dashboard
  app.get(prefixAdmin + '/dashboard', requireAdminAuth, function (req: Request, res: Response) {
    const admin = req.admin as Admin
    res.render('admin/pages/dashboard.pug', { pageTitle: 'Admin - Dashboard', admin: admin })
  })
}
