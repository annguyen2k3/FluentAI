import { Router } from 'express'
import {
  createLevelController,
  deleteLevelController,
  renderLevelsController,
  updateLevelController,
  createTypeController,
  deleteTypeController,
  renderTypesController,
  updateTypeController,
  createTopicController,
  deleteTopicController,
  renderTopicsController,
  updateTopicController
} from '~/controllers/admin/manage-category.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createLevelValidator,
  updateLevelValidator,
  deleteLevelValidator,
  createTypeValidator,
  updateTypeValidator,
  deleteTypeValidator,
  createTopicValidator,
  updateTopicValidator,
  deleteTopicValidator
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

// GET /admin/categories/topics
// Description: Render page manage categories topics
manageCategoryRoutes.get('/topics', requireAdminAuth, wrapRequestHandler(renderTopicsController))

// POST /admin/categories/topics
// Description: Create topic
// Body: {title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.post(
  '/topics',
  requireAdminAuth,
  createTopicValidator,
  wrapRequestHandler(createTopicController)
)

// PUT /admin/categories/topics
// Description: Update topic
// Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
manageCategoryRoutes.put(
  '/topics',
  requireAdminAuth,
  updateTopicValidator,
  wrapRequestHandler(updateTopicController)
)

// DELETE /admin/categories/topics
// Description: Delete topic
// Body: {id: string}
manageCategoryRoutes.delete(
  '/topics',
  requireAdminAuth,
  deleteTopicValidator,
  wrapRequestHandler(deleteTopicController)
)

export default manageCategoryRoutes
