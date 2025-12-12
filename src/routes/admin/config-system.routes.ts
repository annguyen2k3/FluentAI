import { Router } from 'express'
import {
  renderConfigScoreController,
  updateConfigScoreController
} from '~/controllers/admin/config-score.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const configSystemRoutes = Router()

// GET /admin/configs/score
// Description: Render config score page
configSystemRoutes.get(
  '/score',
  requireAdminAuth,
  wrapRequestHandler(renderConfigScoreController)
)

// PUT /admin/configs/score
// Description: Update config score
// Body: { [UserScoreType]: number }
configSystemRoutes.put(
  '/score',
  requireAdminAuth,
  wrapRequestHandler(updateConfigScoreController)
)

export default configSystemRoutes
