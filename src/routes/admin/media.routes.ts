import { Router } from 'express'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
import { uploadImageControllerToTinyMCE } from '~/controllers/admin/media.controllers'

const mediasRoutes = Router()

mediasRoutes.post(
  '/upload-image-to-tiny-mce',
  requireAdminAuth,
  wrapRequestHandler(uploadImageControllerToTinyMCE)
)

export default mediasRoutes
