import { Router } from 'express'
import {
  deleteSSHistoryController,
  evaluateSSController,
  evaluateSSCustomTopicController,
  generateSSAudioController,
  getSSListController,
  previewSSTopicController,
  renderSSListController,
  renderSSPracticeController,
  renderSSPracticeCustomTopicController
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
// Query: level, topic, page, limit, search, sortKey, sortOrder, status
speakingSentenceRoutes.get('/list', wrapRequestHandler(getSSListController))

// POST /speaking-sentence/practice/audio
// Description: Generate audio for speaking sentence
// Method: POST
speakingSentenceRoutes.post(
  '/practice/audio',
  wrapRequestHandler(generateSSAudioController)
)

// POST /speaking-sentence/practice/custom-topic/evaluate
// Description: Evaluate speaking sentence for custom topic
// Method: POST
// NOTE: Must be before /practice/:slug routes to avoid route conflict
speakingSentenceRoutes.post(
  '/practice/custom-topic/evaluate',
  wrapRequestHandler(evaluateSSCustomTopicController)
)

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
// Params: slug: string
// Headers: Content-Type: multipart/form-data
// Body: audio: file, enSentence: string
speakingSentenceRoutes.post(
  '/practice/:slug/evaluate',
  wrapRequestHandler(evaluateSSController)
)

// DELETE /speaking-sentence/history/:slug
// Description: Delete history speaking sentence
// Method: DELETE
speakingSentenceRoutes.delete(
  '/history/:slug',
  wrapRequestHandler(deleteSSHistoryController)
)

// POST /speaking-sentence/preview-topic
// Description: Preview speaking sentence topic for user custom
// Method: POST
speakingSentenceRoutes.post(
  '/preview-topic',
  wrapRequestHandler(previewSSTopicController)
)

// GET /speaking-sentence/practice-custom-topic
// Description: Render speaking sentence practice custom topic page
// Method: GET
speakingSentenceRoutes.get(
  '/practice-custom-topic',
  wrapRequestHandler(renderSSPracticeCustomTopicController)
)

export default speakingSentenceRoutes
