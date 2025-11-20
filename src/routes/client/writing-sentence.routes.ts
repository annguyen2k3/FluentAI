import { Router } from 'express'
import {
  getCompleteWSController,
  getPracticeCustomTopicWSController,
  getPracticeWSController,
  getSetupWritingSentenceController,
  getSystemListWSController,
  getWSListController,
  postCustomTopicPreviewWSController,
  postPracticeWSController
} from '~/controllers/client/writing-sentence.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import {
  postCustomTopicPreviewWSValidator,
  postPracticeWSValidator,
  renderWSPraticeValidator
} from '~/middlewares/writing-sentence.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const writingSentenceRoutes = Router()

// GET /writing-sentence/setup
// Description: Render setup writing sentence page
// Method: GET
writingSentenceRoutes.get(
  '/setup',
  requireAuth,
  wrapRequestHandler(getSetupWritingSentenceController)
)

// GET /writing-sentence/system-topic
// Description: Render system topic writing sentence page
// Method: GET
writingSentenceRoutes.get(
  '/system-list',
  requireAuth,
  wrapRequestHandler(getSystemListWSController)
)

// GET /writing-sentence/list
// Description: Get list of writing sentences
// Method: GET
// Params: level, topic, page, limit, search, sortKey, sortOrder
writingSentenceRoutes.get(
  '/list',
  requireAuth,
  wrapRequestHandler(getWSListController)
)

// GET /writing-sentence/practice/:slug
// Description: Render practice writing sentence page
// Method: GET
writingSentenceRoutes.get(
  '/practice/:slug',
  requireAuth,
  renderWSPraticeValidator,
  wrapRequestHandler(getPracticeWSController)
)

// POST /writing-sentence/practice/:slug
// Description: Post practice writing sentence page
// Method: POST
writingSentenceRoutes.post(
  '/practice/:slug',
  requireAuth,
  renderWSPraticeValidator,
  postPracticeWSValidator,
  wrapRequestHandler(postPracticeWSController)
)

// GET /writing-sentence/practice/complete/:slug
// Description: Render complete writing sentence page
// Method: GET
// Params: {slug: string}
writingSentenceRoutes.get(
  '/practice/complete/:slug',
  requireAuth,
  renderWSPraticeValidator,
  wrapRequestHandler(getCompleteWSController)
)

// POST /writing-sentence/custom-topic/preview
// Description: Post custom topic preview
// Method: POST
// Body: {topic: string, level: string}
writingSentenceRoutes.post(
  '/custom-topic/preview',
  requireAuth,
  postCustomTopicPreviewWSValidator,
  wrapRequestHandler(postCustomTopicPreviewWSController)
)

// GET /writing-sentence/practice/custom-topic/:id-ws-list-preview
// Description: Get practice custom topic
// Method: GET
// Params: id-ws-list-preview
writingSentenceRoutes.get(
  '/practice/custom-topic/:idPreview',
  requireAuth,
  wrapRequestHandler(getPracticeCustomTopicWSController)
)

export default writingSentenceRoutes
