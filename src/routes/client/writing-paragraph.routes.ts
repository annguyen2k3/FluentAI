import { Router } from 'express'
import {
  getSetupWPController,
  getWPListController,
  renderListWPController,
  renderPracticeWPController
} from '~/controllers/client/writing-paragraph.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import {
  getListWPValidator,
  getSystemListWPValidator
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
  wrapRequestHandler(renderPracticeWPController)
)

export default writingParagraphRoutes
