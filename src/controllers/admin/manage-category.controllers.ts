import { Request, Response } from 'express'
import { Admin } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
import categoriesServices from '~/services/categories.service'

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
  const level = await categoriesServices.createLevel(
    title,
    description,
    fa_class_icon,
    slug,
    pos
  )
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

export const renderTypesController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const types = await categoriesServices.getTypes()
  res.render('admin/pages/categories/types.pug', {
    pageTitle: 'Admin - Quản lý loại',
    admin,
    types
  })
}

export const createTypeController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { title, description, fa_class_icon, slug, pos } = req.body
  const type = await categoriesServices.createType(
    title,
    description,
    fa_class_icon,
    slug,
    pos
  )
  res.status(HttpStatus.CREATED).json({
    status: HttpStatus.CREATED,
    message: 'Loại đã được tạo thành công',
    type
  })
}

export const updateTypeController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { id, title, description, fa_class_icon, slug, pos } = req.body
  const type = await categoriesServices.updateType(
    id,
    title,
    description,
    fa_class_icon,
    slug,
    pos
  )
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Loại đã được cập nhật thành công',
    type
  })
}

export const deleteTypeController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { id } = req.body
  const result = await categoriesServices.deleteType(id)
  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Có lỗi xảy ra khi xóa loại'
    })
    return
  }
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Loại đã được xóa thành công'
  })
}

export const renderTopicsController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const topics = await categoriesServices.getTopics()
  res.render('admin/pages/categories/topics.pug', {
    pageTitle: 'Admin - Quản lý chủ đề',
    admin,
    topics
  })
}

export const createTopicController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { title, description, fa_class_icon, slug, pos } = req.body
  const topic = await categoriesServices.createTopic(
    title,
    description,
    fa_class_icon,
    slug,
    pos
  )
  res.status(HttpStatus.CREATED).json({
    status: HttpStatus.CREATED,
    message: 'Chủ đề đã được tạo thành công',
    topic
  })
}

export const updateTopicController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { id, title, description, fa_class_icon, slug, pos } = req.body
  const topic = await categoriesServices.updateTopic(
    id,
    title,
    description,
    fa_class_icon,
    slug,
    pos
  )
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Chủ đề đã được cập nhật thành công',
    topic
  })
}

export const deleteTopicController = async (req: Request, res: Response) => {
  const admin = req.admin as Admin
  const { id } = req.body
  const result = await categoriesServices.deleteTopic(id)
  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Có lỗi xảy ra khi xóa chủ đề'
    })
    return
  }
  res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Chủ đề đã được xóa thành công'
  })
}
