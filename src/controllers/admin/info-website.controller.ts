import { Request, Response } from 'express'
import { databaseService } from '~/services/database.service'
import Admin from '~/models/schemas/admin.schema'
import { config } from 'dotenv'
import { ObjectId } from 'mongodb'
import { HttpStatus } from '~/constants/httpStatus'
config()

const prefixAdmin = process.env.PREFIX_ADMIN

// GET /admin/info-website
export const renderInfoWebsiteController = async (
  req: Request,
  res: Response
) => {
  const admin = req.admin as Admin
  const infoWebsite = await databaseService.infoWebsites.findOne({})
  res.render('admin/pages/info-website/info-website.pug', {
    pageTitle: 'Admin - Thông tin website',
    admin,
    prefixAdmin,
    infoWebsite
  })
}

// PUT /admin/info-website
export const updateInfoWebsiteController = async (
  req: Request,
  res: Response
) => {
  const { name, description, url_logo, phone_number, email, address } = req.body

  if (
    !name ||
    !description ||
    !url_logo ||
    !phone_number ||
    !email ||
    !address
  ) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Vui lòng nhập đầy đủ thông tin',
      status: HttpStatus.BAD_REQUEST
    })
  }

  const infoWebsite = await databaseService.infoWebsites.findOne({})
  if (!infoWebsite) {
    return res.status(HttpStatus.NOT_FOUND).json({
      message: 'Thông tin website không tồn tại',
      status: HttpStatus.NOT_FOUND
    })
  }
  await databaseService.infoWebsites.updateOne(
    { _id: new ObjectId(infoWebsite._id) },
    {
      $set: {
        name,
        description,
        url_logo,
        phone_number,
        email,
        address,
        update_at: new Date()
      }
    }
  )
  res.status(HttpStatus.OK).json({
    message: 'Cập nhật thông tin website thành công',
    status: HttpStatus.OK
  })
}
