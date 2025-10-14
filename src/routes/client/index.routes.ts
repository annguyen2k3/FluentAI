import { Express } from 'express'
import authRoutes from './auth.routes'

export default function (app: Express) {
  app.use('/auth', authRoutes)
}
