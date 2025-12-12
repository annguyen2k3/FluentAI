import { Request, Response } from 'express'
import { config } from 'dotenv'
import systemConfigService from '~/services/system-config.service'
import adminServices from '~/services/admin.service'
import Admin from '~/models/schemas/admin.schema'
import { HttpStatus } from '~/constants/httpStatus'

config()

const prefixAdmin = process.env.PREFIX_ADMIN

export const renderConfigPricingCreditController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const configPricing = await systemConfigService.getPricingCredit(true)
  const adminUpdateConfigPricingCredit = await adminServices.getAdminById(
    configPricing?.config?.updated_by?.toString() || ''
  )
  res.render('admin/pages/configs/pricing-credit.pug', {
    pageTitle: 'Admin - Cấu hình gói credit',
    admin,
    prefixAdmin,
    config: configPricing,
    adminUpdateConfigPricingCredit
  })
}

export const updateConfigPricingCreditController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const parameters = Array.isArray(req.body) ? req.body : []

  const result = await systemConfigService.updatePricingCreditConfig(
    admin._id as any,
    parameters
  )
  if (!result) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: 'Cập nhật cấu hình gói credit thất bại'
    })
  }
  return res.status(HttpStatus.OK).json({
    status: HttpStatus.OK,
    message: 'Cập nhật cấu hình gói credit thành công'
  })
}

