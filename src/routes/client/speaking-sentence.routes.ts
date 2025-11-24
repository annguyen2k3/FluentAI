import { Router } from 'express'
import {
  getSSListController,
  renderSSListController
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
// speakingSentenceRoutes.get('/practice', wrapRequestHandler(renderSSPracticeController))

export default speakingSentenceRoutes
