import { Router } from 'express'
import {
  deleteSSHistoryController,
  evaluateSSController,
  generateSSAudioController,
  getSSListController,
  renderSSListController,
  renderSSPracticeController
} from '~/controllers/client/speaking-sentence.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const speakingSentenceRoutes = Router()

speakingSentenceRoutes.use(requireAuth)

// GET /speaking-sentence
// Description: Render speaking sentence page
// Method: GET
speakingSentenceRoutes.get('/', wrapRequestHandler(renderSSListController))

// GET /speaking-sentence/list
// Description: Get list of speaking sentences
// Method: GET
// Query: level, topic, page, limit, search, sortKey, sortOrder
speakingSentenceRoutes.get('/list', wrapRequestHandler(getSSListController))

// GET /speaking-sentence/practice
// Description: Render speaking sentence practice page
// Method: GET
speakingSentenceRoutes.get(
  '/practice/:slug',
  wrapRequestHandler(renderSSPracticeController)
)

// POST /speaking-sentence/practice/evaluate
// Description: Evaluate speaking sentence
// Method: POST
speakingSentenceRoutes.post(
  '/practice/:slug/evaluate',
  wrapRequestHandler(evaluateSSController)
)

// POST /speaking-sentence/practice/audio
// Description: Generate audio for speaking sentence
// Method: POST
speakingSentenceRoutes.post(
  '/practice/audio',
  wrapRequestHandler(generateSSAudioController)
)

// DELETE /speaking-sentence/history/:slug
// Description: Delete history speaking sentence
// Method: DELETE
speakingSentenceRoutes.delete(
  '/history/:slug',
  wrapRequestHandler(deleteSSHistoryController)
)

export default speakingSentenceRoutes
