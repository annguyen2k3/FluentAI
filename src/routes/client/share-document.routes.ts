import { Router } from 'express'
import {
  bookmarkShareDocumentController,
  getShareDocumentByIdController,
  getShareDocumentListController,
  renderShareDocumentController,
  unbookmarkShareDocumentController
} from '~/controllers/client/share-document.controller'
import { optionalAuth, requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const shareDocumentRoutes = Router()

// GET /share-document
// Description: Render share document page
shareDocumentRoutes.get(
  '/',
  optionalAuth,
  wrapRequestHandler(renderShareDocumentController)
)

// GET /share-document/list
// Description: Get list of share documents
// Method: GET
// Query: { page: number, limit: number, search: string, sortKey: string, sortOrder: 'asc' | 'desc' }
shareDocumentRoutes.get(
  '/list',
  optionalAuth,
  wrapRequestHandler(getShareDocumentListController)
)

// GET /share-document/:slug
// Description: Get share document by slug
// Method: GET
// Params: { slug: string }
shareDocumentRoutes.get(
  '/:slug',
  optionalAuth,
  wrapRequestHandler(getShareDocumentByIdController)
)

// POST /share-document/bookmark
// Description: Bookmark a share document
// Method: POST
// Body: { shareDocumentId: string }
shareDocumentRoutes.post(
  '/bookmark',
  requireAuth,
  wrapRequestHandler(bookmarkShareDocumentController)
)

// POST /share-document/unbookmark
// Description: Unbookmark a share document
// Method: POST
// Body: { shareDocumentId: string }
shareDocumentRoutes.post(
  '/unbookmark',
  requireAuth,
  wrapRequestHandler(unbookmarkShareDocumentController)
)

export default shareDocumentRoutes
