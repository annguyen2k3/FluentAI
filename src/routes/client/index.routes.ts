import { Express, Request, Response } from 'express'
import usersRoutes from './users.routes'

export default function (app: Express) {
  app.use('/users', usersRoutes)

  // Bridge route in case OAuth providers redirect to root without the `/users` prefix
  app.get('/oauth/google', (req: Request, res: Response) => {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''
    return res.redirect(`/users/oauth/google/callback${query}`)
  })

  app.get('/', (req: Request, res: Response) => {
    res.send('Trang dashboard')
  })
}
