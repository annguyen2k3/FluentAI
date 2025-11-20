import { Router } from 'express'
import {
  getCompleteWPController,
  getPracticeCustomTopicWPController,
  getRandomWPController,
  getSetupWPController,
  getWPListController,
  postCustomTopicPreviewWPController,
  postPracticeWPController,
  postPreviewContentWPController,
  renderListWPController,
  renderPracticeWPController
} from '~/controllers/client/writing-paragraph.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import {
  getListWPValidator,
  getSystemListWPValidator,
  postCustomTopicPreviewWPValidator,
  renderWPPraticeValidator
} from '~/middlewares/writing-paragraph.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const writingParagraphRoutes = Router()

// GET /writing-paragraph/setup
// Description: Render setup writing paragraph page
// Method: GET
writingParagraphRoutes.get(
  '/setup',
  requireAuth,
  wrapRequestHandler(getSetupWPController)
)

// GET /writing-paragraph/system-list
// Description: Render system list writing paragraph page
// Method: GET
// Query: {level: string, type: string}
writingParagraphRoutes.get(
  '/system-list',
  requireAuth,
  getSystemListWPValidator,
  wrapRequestHandler(renderListWPController)
)

// GET /writing-paragraph/list
// Description: Get list of writing paragraphs
// Method: GET
// Query: {level: string, type: string, topic: string}
writingParagraphRoutes.get(
  '/list',
  requireAuth,
  getListWPValidator,
  wrapRequestHandler(getWPListController)
)

// GET /writing-paragraph/practice/:slug
// Description: Render practice writing paragraph page
// Method: GET
// Params: {slug: string}
writingParagraphRoutes.get(
  '/practice/:slug',
  requireAuth,
  renderWPPraticeValidator,
  wrapRequestHandler(renderPracticeWPController)
)

// POST /writing-paragraph/practice/:slug
// Description: Post practice writing paragraph page
// Method: POST
// Params: {slug: string}
// Body: {sentence_vi: string, user_translation: string}
writingParagraphRoutes.post(
  '/practice/:slug',
  requireAuth,
  renderWPPraticeValidator,
  wrapRequestHandler(postPracticeWPController)
)

// GET /writing-paragraph/practice/complete/:slug
// Description: Render complete writing paragraph page
// Method: GET
// Params: {slug: string}
writingParagraphRoutes.get(
  '/practice/complete/:slug',
  requireAuth,
  renderWPPraticeValidator,
  wrapRequestHandler(getCompleteWPController)
)

// POST /writing-paragraph/custom-topic/preview
// Description: Post custom topic preview
// Method: POST
// Body: {topic: string, level: string}
writingParagraphRoutes.post(
  '/custom-topic/preview',
  requireAuth,
  postCustomTopicPreviewWPValidator,
  wrapRequestHandler(postCustomTopicPreviewWPController)
)

// GET /writing-paragraph/practice/custom-topic/:idPreview
// Description: Get practice custom topic
// Method: GET
// Params: idPreview
writingParagraphRoutes.get(
  '/practice/custom-topic/:idPreview',
  requireAuth,
  wrapRequestHandler(getPracticeCustomTopicWPController)
)

// POST /writing-paragraph/practice/preview-content
// Description: Post preview content
// Method: POST
// Body: {content: string}
writingParagraphRoutes.post(
  '/preview-content',
  requireAuth,
  wrapRequestHandler(postPreviewContentWPController)
)

// GET /writing-paragraph/random
// Description: Get random writing paragraph
// Method: GET
// Query: {level: string, type: string, topic: string}
writingParagraphRoutes.get(
  '/random',
  requireAuth,
  wrapRequestHandler(getRandomWPController)
)

export default writingParagraphRoutes
