import { Request, Response } from 'express'
import systemConfigService from '~/services/system-config.service'
import { config } from 'dotenv'
import adminServices from '~/services/admin.service'
import { CreditUsageType } from '~/constants/enum'
import Admin from '~/models/schemas/admin.schema'
import { HttpStatus } from '~/constants/httpStatus'

config()

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderConfigCreditUsageController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const config = await systemConfigService.getPracticeCost(true)
  const adminUpdateConfigCreditUsage = await adminServices.getAdminById(
    config?.config?.updated_by?.toString() || ''
  )
  res.render('admin/pages/configs/credit-usage.pug', {
    pageTitle: 'Admin - Cấu hình credit sử dụng',
    admin,
    prefixAdmin,
    config,
    adminUpdateConfigCreditUsage
  })
}

export const updateConfigCreditUsageController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const data = req.body as Record<CreditUsageType, number>

  const result = await systemConfigService.updatePracticeCostConfig(
    admin._id as any,
    data
  )
  if (!result) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Cập nhật cấu hình credit sử dụng thất bại'
    })
  }
  return res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cập nhật cấu hình credit sử dụng thành công'
  })
}

