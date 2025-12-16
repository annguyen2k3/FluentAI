import { Router } from 'express'
import {
  renderManageShareDocumentController,
  renderShareDocumentFormController,
  getListShareDocumentController,
  createShareDocumentController,
  updateShareDocumentController,
  deleteShareDocumentController,
  duplicateShareDocumentController
} from '~/controllers/admin/share-document.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const shareDocumentRoutes = Router()

shareDocumentRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageShareDocumentController)
)

shareDocumentRoutes.get(
  '/form',
  requireAdminAuth,
  wrapRequestHandler(renderShareDocumentFormController)
)

shareDocumentRoutes.get(
  '/form/:documentId',
  requireAdminAuth,
  wrapRequestHandler(renderShareDocumentFormController)
)

shareDocumentRoutes.get(
  '/list',
  requireAdminAuth,
  wrapRequestHandler(getListShareDocumentController)
)

shareDocumentRoutes.post(
  '/create',
  requireAdminAuth,
  wrapRequestHandler(createShareDocumentController)
)

shareDocumentRoutes.put(
  '/update',
  requireAdminAuth,
  wrapRequestHandler(updateShareDocumentController)
)

shareDocumentRoutes.delete(
  '/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteShareDocumentController)
)

shareDocumentRoutes.post(
  '/duplicate',
  requireAdminAuth,
  wrapRequestHandler(duplicateShareDocumentController)
)

export default shareDocumentRoutes
