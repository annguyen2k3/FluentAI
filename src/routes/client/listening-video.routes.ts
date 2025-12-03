import { Router } from 'express'
import {
  getLVListController,
  renderListeningVideoController
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

export default listeningVideoRoutes
