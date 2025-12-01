import { Router } from 'express'
import {
  getSVListController,
  renderSpeakingShadowingController
} from '~/controllers/client/speaking-shadowing.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const speakingShadowingRoutes = Router()

// GET /speaking-shadowing
// Description: Render speaking shadowing page
// Method: GET
speakingShadowingRoutes.get(
  '/',
  requireAuth,
  wrapRequestHandler(renderSpeakingShadowingController)
)

// GET /speaking-shadowing/list
// Description: Get list video of speaking shadowing
// Method: GET
// Query: level, topic, page, limit, search, sortKey, sortOrder, status
speakingShadowingRoutes.get(
  '/list',
  requireAuth,
  wrapRequestHandler(getSVListController)
)

export default speakingShadowingRoutes
