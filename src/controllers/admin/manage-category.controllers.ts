import { Request, Response } from 'express'
import { Admin } from 'mongodb'

export const renderLevelsController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  res.render('admin/pages/categories/levels.pug', { pageTitle: 'Admin - Quản lý cấp độ', admin })
}
