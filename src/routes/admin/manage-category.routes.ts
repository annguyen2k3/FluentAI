import { Router } from 'express'
import { renderLevelsController } from '~/controllers/admin/manage-category.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const manageCategoryRoutes = Router()

// GET /admin/categories/levels
// Description: Render page manage categories levels
manageCategoryRoutes.get('/levels', requireAdminAuth, wrapRequestHandler(renderLevelsController))

export default manageCategoryRoutes
