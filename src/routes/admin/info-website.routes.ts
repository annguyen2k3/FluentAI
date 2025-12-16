import { Router } from 'express'
import {
  renderInfoWebsiteController,
  updateInfoWebsiteController
} from '~/controllers/admin/info-website.controller'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const infoWebsiteRoutes = Router()

// GET /admin/info-website
// Description: Render info website page
infoWebsiteRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderInfoWebsiteController)
)

// PUT /admin/info-website
// Description: Update info website
// Body: { name: string, description: string, url_logo: string, phone_number: string, email: string, address: string }
infoWebsiteRoutes.put(
  '/',
  requireAdminAuth,
  wrapRequestHandler(updateInfoWebsiteController)
)

export default infoWebsiteRoutes
