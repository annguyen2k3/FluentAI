import { Router } from 'express'
import {
  createLevelController,
  deleteLevelController,
  renderLevelsController,
  updateLevelController
} from '~/controllers/admin/manage-category.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createCategoriesValidator,
  deleteCategoriesValidator,
  updateCategoriesValidator
} from '~/middlewares/categories.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const manageCategoryRoutes = Router()

// GET /admin/categories/levels
// Description: Render page manage categories levels
manageCategoryRoutes.get('/levels', requireAdminAuth, wrapRequestHandler(renderLevelsController))

// POST /admin/categories/levels
// Description: Create level
// Body: {title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.post(
  '/levels',
  requireAdminAuth,
  createCategoriesValidator,
  wrapRequestHandler(createLevelController)
)

// PUT /admin/categories/levels
// Description: Update level
// Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.put(
  '/levels',
  requireAdminAuth,
  updateCategoriesValidator,
  wrapRequestHandler(updateLevelController)
)

// DELETE /admin/categories/levels
// Description: Delete level
// Body: {id: string}
manageCategoryRoutes.delete(
  '/levels',
  requireAdminAuth,
  deleteCategoriesValidator,
  wrapRequestHandler(deleteLevelController)
)

export default manageCategoryRoutes
