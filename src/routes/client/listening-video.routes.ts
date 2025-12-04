import { Router } from 'express'
import {
  getLVListController,
  renderListeningVideoController,
  renderLVALNController,
  renderLVCIController,
  updateLVStatusController
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

// GET /listening-video/active-listening/:slug
// Description: Render listening video page for active listening
// Method: GET
listeningVideoRoutes.get(
  '/active-listening/:slug',
  wrapRequestHandler(renderLVALNController)
)

// PUT /listening-video/update-status/:slug
// Description: Update status of listening video
// Method: PUT
// Params: slug: string
// Body: status: StatusLesson
listeningVideoRoutes.put(
  '/update-status/:slug',
  wrapRequestHandler(updateLVStatusController)
)

export default listeningVideoRoutes
