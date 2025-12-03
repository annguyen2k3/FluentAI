import { Router } from 'express'
import {
  getLVListController,
  renderListeningVideoController,
  renderLVCIController
} from '~/controllers/client/listening-video.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const listeningVideoRoutes = Router()

listeningVideoRoutes.use(requireAuth)

// GET /listening-video
// Description: Render listening video page
// Method: GET
listeningVideoRoutes.get(
  '/',
  wrapRequestHandler(renderListeningVideoController)
)

// GET /listening-video/list
// Description: Get list video of listening video
// Method: GET
// Query: level, topic, page, limit, search, sortKey, sortOrder, status
listeningVideoRoutes.get('/list', wrapRequestHandler(getLVListController))

// GET /listening-video/comprehensible-input/:slug
// Description: Render listening video page for comprehensible input
// Method: GET
listeningVideoRoutes.get(
  '/comprehensible-input/:slug',
  wrapRequestHandler(renderLVCIController)
)

export default listeningVideoRoutes
