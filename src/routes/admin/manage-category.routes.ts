import { Router } from 'express'
import {
  createLevelController,
  deleteLevelController,
  renderLevelsController,
  updateLevelController,
  createTypeController,
  deleteTypeController,
  renderTypesController,
  updateTypeController
} from '~/controllers/admin/manage-category.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createLevelValidator,
  updateLevelValidator,
  deleteLevelValidator,
  createTypeValidator,
  updateTypeValidator,
  deleteTypeValidator
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
  createLevelValidator,
  wrapRequestHandler(createLevelController)
)

// PUT /admin/categories/levels
// Description: Update level
// Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.put(
  '/levels',
  requireAdminAuth,
  updateLevelValidator,
  wrapRequestHandler(updateLevelController)
)

// DELETE /admin/categories/levels
// Description: Delete level
// Body: {id: string}
manageCategoryRoutes.delete(
  '/levels',
  requireAdminAuth,
  deleteLevelValidator,
  wrapRequestHandler(deleteLevelController)
)

// GET /admin/categories/types
// Description: Render page manage categories types
manageCategoryRoutes.get('/types', requireAdminAuth, wrapRequestHandler(renderTypesController))

// POST /admin/categories/types
// Description: Create type
// Body: {title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.post(
  '/types',
  requireAdminAuth,
  createTypeValidator,
  wrapRequestHandler(createTypeController)
)

// PUT /admin/categories/types
// Description: Update type
// Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.put(
  '/types',
  requireAdminAuth,
  updateTypeValidator,
  wrapRequestHandler(updateTypeController)
)

// DELETE /admin/categories/types
// Description: Delete type
// Body: {id: string}
manageCategoryRoutes.delete(
  '/types',
  requireAdminAuth,
  deleteTypeValidator,
  wrapRequestHandler(deleteTypeController)
)

export default manageCategoryRoutes
