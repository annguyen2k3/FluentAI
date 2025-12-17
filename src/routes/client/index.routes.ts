import { Express, Request, Response } from 'express'
import usersRoutes from './users.routes'
import { optionalAuth, requireAuth } from '~/middlewares/users.middleware'
import writingSentenceRoutes from './writing-sentence.routes'
import writingParagraphRoutes from './writing-paragraph.routes'
import speakingSentenceRoutes from './speaking-sentence.routes'
import speakingShadowingRoutes from './speaking-shadowing.routes'
import listeningVideoRoutes from './listening-video.routes'
import User from '~/models/schemas/users.schema'
import scoreService from '~/services/score.service'
import { ObjectId } from 'mongodb'
import paymentRoutes from './payment.routes'
import shareDocumentRoutes from './share-document.routes'
import shareDocumentServices from '~/services/share-document.services'

export default function (app: Express) {
  app.get('/', (req: Request, res: Response) => {
    const access_token = req.cookies?.access_token as string
    if (access_token) {
      return res.redirect('/dashboard')
    }
    return res.redirect('/introduction')
  })

  app.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
    const rankingResult = await scoreService.getListRanking({
      page: 1,
      limit: 5
    })
    const rankingList = rankingResult.data
    const userMonthlyScore = await scoreService.getUserMonthlyScore(
      req.user._id
    )
    const userBookmarks = await shareDocumentServices.getUserBookmarks(
      req.user,
      {
        page: 1,
        limit: 3
      }
    )

    res.render('client/pages/dashboard.pug', {
      pageTitle: 'FluentAI - Dashboard',
      user: req.user,
      rankingList,
      userMonthlyScore,
      userBookmarks
    })
  })

  app.get('/ranking', optionalAuth, async (req: Request, res: Response) => {
    const user = req.user as User
    const now = new Date()
    const targetYear = Number(req.query.year) || now.getFullYear()
    const targetMonth = Number(req.query.month) || now.getMonth() + 1
    let userMonthlyScore = null

    if (user) {
      userMonthlyScore = await scoreService.getUserMonthlyScore(
        user._id as ObjectId,
        targetYear,
        targetMonth
      )
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const rankingResult = await scoreService.getListRanking({
      page,
      limit,
      year: targetYear,
      month: targetMonth
    })
    const rankingList = rankingResult.data
    const pagination = rankingResult.pagination
    res.render('client/pages/ranking.pug', {
      pageTitle: 'FluentAI - Xếp hạng',
      user,
      rankingList,
      pagination,
      userMonthlyScore,
      targetYear,
      targetMonth
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

  app.use('/payment', paymentRoutes)

  app.use('/share-document', shareDocumentRoutes)
}
