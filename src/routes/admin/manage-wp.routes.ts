import { Router } from 'express'
import {
  createWPListController,
  deleteWPListController,
  getListWpController,
  renderManageWpController,
  updateWPListController
} from '~/controllers/admin/manage-wp.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createWPListValidator,
  updateWPListValidator
} from '~/middlewares/writing-paragraph.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const manageWpRoutes = Router()

manageWpRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageWpController)
)

manageWpRoutes.get(
  '/list',
  requireAdminAuth,
  wrapRequestHandler(getListWpController)
)

manageWpRoutes.post(
  '/create',
  requireAdminAuth,
  createWPListValidator,
  wrapRequestHandler(createWPListController)
)

manageWpRoutes.put(
  '/update',
  requireAdminAuth,
  updateWPListValidator,
  wrapRequestHandler(updateWPListController)
)

manageWpRoutes.delete(
  '/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteWPListController)
)

export default manageWpRoutes
