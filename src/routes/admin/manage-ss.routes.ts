import { Router } from 'express'
import {
  createSSListController,
  deleteSSListController,
  getListSsController,
  renderManageSsController,
  updateSSListController
} from '~/controllers/admin/manage-ss.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createSSListValidator,
  updateSSListValidator
} from '~/middlewares/speaking-sentence.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const manageSsRoutes = Router()

manageSsRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageSsController)
)

manageSsRoutes.get(
  '/list',
  requireAdminAuth,
  wrapRequestHandler(getListSsController)
)

manageSsRoutes.post(
  '/create',
  requireAdminAuth,
  createSSListValidator,
  wrapRequestHandler(createSSListController)
)

manageSsRoutes.put(
  '/update',
  requireAdminAuth,
  updateSSListValidator,
  wrapRequestHandler(updateSSListController)
)

manageSsRoutes.delete(
  '/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteSSListController)
)

export default manageSsRoutes
