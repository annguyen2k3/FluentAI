import { Express, Request, Response } from 'express'
import usersRoutes from './users.routes'
import { optionalAuth, requireAuth } from '~/middlewares/users.middleware'
import writingSentenceRoutes from './writing-sentence.routes'
import writingParagraphRoutes from './writing-paragraph.routes'
import speakingSentenceRoutes from './speaking-sentence.routes'
import speakingShadowingRoutes from './speaking-shadowing.routes'
import listeningVideoRoutes from './listening-video.routes'
import User from '~/models/schemas/users.schema'

export default function (app: Express) {
  app.get('/', (req: Request, res: Response) => {
    const access_token = req.cookies?.access_token as string
    if (access_token) {
      return res.redirect('/dashboard')
    }
    return res.redirect('/introduction')
  })

  app.get('/dashboard', requireAuth, (req: Request, res: Response) => {
    res.render('client/pages/dashboard.pug', {
      pageTitle: 'FluentAI - Dashboard',
      user: req.user
    })
  })

  app.use('/users', usersRoutes)

  // Bridge route in case OAuth providers redirect to root without the `/users` prefix
  app.get('/oauth/google', (req: Request, res: Response) => {
    const query = req.url.includes('?')
      ? req.url.substring(req.url.indexOf('?'))
      : ''
    return res.redirect(`/users/oauth/google/callback${query}`)
  })

  app.use('/writing-sentence', writingSentenceRoutes)

  app.use('/writing-paragraph', writingParagraphRoutes)

  app.use('/speaking-sentence', speakingSentenceRoutes)

  app.use('/speaking-shadowing', speakingShadowingRoutes)

  app.use('/listening-video', listeningVideoRoutes)

  app.get('/introduction', optionalAuth, (req: Request, res: Response) => {
    const user = req.user as User
    res.render('client/pages/introduction.pug', {
      pageTitle: 'FluentAI - Giới thiệu',
      user
    })
  })
}
