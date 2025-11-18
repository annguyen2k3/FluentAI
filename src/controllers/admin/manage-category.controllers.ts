import { Request, Response } from 'express'
import { Admin } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import categoriesServices from '~/services/categories.services'

export const renderLevelsController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const levels = await categoriesServices.getLevels()
  res.render('admin/pages/categories/levels.pug', {
    pageTitle: 'Admin - Quản lý cấp độ',
    admin,
    levels
  })
}

export const createLevelController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { title, description, fa_class_icon, slug, pos } = req.body
  const level = await categoriesServices.createLevel(title, description, fa_class_icon, slug, pos)
  res.status(HttpStatus.CREATED).json({
    status: HttpStatus.CREATED,
    message: 'Cấp độ đã được tạo thành công',
    level
  })
}

export const updateLevelController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { id, title, description, fa_class_icon, slug, pos } = req.body
  const level = await categoriesServices.updateLevel(
    id,
    title,
    description,
    fa_class_icon,
    slug,
    pos
  )
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cấp độ đã được cập nhật thành công',
    level
  })
}

export const deleteLevelController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { id } = req.body
  const result = await categoriesServices.deleteLevel(id)
  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Có lỗi xảy ra khi xóa cấp độ'
    })
    return
  }
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cấp độ đã được xóa thành công'
  })
}
