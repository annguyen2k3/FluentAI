import { Request, Response } from 'express'
import systemConfigService from '~/services/system-config.service'
import { config } from 'dotenv'
import adminServices from '~/services/admin.service'
import { UserScoreType } from '~/constants/enum'
import Admin from '~/models/schemas/admin.schema'
import { HttpStatus } from '~/constants/httpStatus'

config()

const prefixAdmin = process.env.PREFIX_ADMIN

// GET /admin/configs/score
export const renderConfigScoreController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const config = await systemConfigService.getPracticeScore(true)
  const adminUpdateConfigScore = await adminServices.getAdminById(
    config?.config?.updated_by?.toString() || ''
  )
  res.render('admin/pages/configs/score.pug', {
    pageTitle: 'Admin - Cấu hình điểm số',
    admin,
    prefixAdmin,
    config,
    adminUpdateConfigScore
  })
}

// PUT /admin/configs/score
export const updateConfigScoreController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const data = req.body as Record<UserScoreType, number>

  const result = await systemConfigService.updatePracticeScoreConfig(
    admin._id as any,
    data
  )
  if (!result) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Cập nhật cấu hình điểm số thất bại'
    })
  }
  return res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cập nhật cấu hình điểm số thành công'
  })
}
