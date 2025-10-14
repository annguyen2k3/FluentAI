import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  res.render('client/pages/auth/login.pug', { pageTitle: 'Login Page' })
}
