import { Request, Response } from 'express'
import { HttpStatus } from '~/constants/httpStatus'
import mediasService from '~/services/medias.service'

export const uploadImageControllerToTinyMCE = async (
  req: Request,
  res: Response
) => {
  const result = await mediasService.uploadImage(req, 'tinymce-images')

  res.status(HttpStatus.OK).json({
    message: 'Upload ảnh thành công',
    status: HttpStatus.OK,
    data: result
  })
}
