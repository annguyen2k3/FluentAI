import { Router } from 'express'
import {
  deleteSVHistoryController,
  evaluateSVController,
  getSVListController,
  renderSpeakingShadowingController,
  renderSVPracticeController
} from '~/controllers/client/speaking-shadowing.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const speakingShadowingRoutes = Router()

speakingShadowingRoutes.use(requireAuth)

// GET /speaking-shadowing
// Description: Render speaking shadowing page
// Method: GET
speakingShadowingRoutes.get(
  '/',
  wrapRequestHandler(renderSpeakingShadowingController)
)

// GET /speaking-shadowing/list
// Description: Get list video of speaking shadowing
// Method: GET
// Query: level, topic, page, limit, search, sortKey, sortOrder, status
speakingShadowingRoutes.get('/list', wrapRequestHandler(getSVListController))

// GET /speaking-shadowing/practice/:slug
// Description: Render speaking shadowing practice page
// Method: GET
speakingShadowingRoutes.get(
  '/practice/:slug',
  wrapRequestHandler(renderSVPracticeController)
)

// POST /speaking-shadowing/practice/:slug/evaluate
// Description: Evaluate speaking shadowing
// Method: POST
// Params: slug: string
// Headers: Content-Type: multipart/form-data
// Body: audio: file, enSentence: string
speakingShadowingRoutes.post(
  '/practice/:slug/evaluate',
  wrapRequestHandler(evaluateSVController)
)

// DELETE /speaking-shadowing/history/:slug
// Description: Delete history speaking shadowing
// Method: DELETE
speakingShadowingRoutes.delete(
  '/history/:slug',
  wrapRequestHandler(deleteSVHistoryController)
)

export default speakingShadowingRoutes
