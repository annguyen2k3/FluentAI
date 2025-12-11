import { Router } from 'express'
import {
  createSVListController,
  deleteSVListController,
  getListSvController,
  renderManageSshController,
  updateSVListController
} from '~/controllers/admin/manage-ssh.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createSVListValidator,
  updateSVListValidator
} from '~/middlewares/speaking-shadowing.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const manageSshRoutes = Router()

manageSshRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageSshController)
)

manageSshRoutes.get(
  '/list',
  requireAdminAuth,
  wrapRequestHandler(getListSvController)
)

manageSshRoutes.post(
  '/create',
  requireAdminAuth,
  createSVListValidator,
  wrapRequestHandler(createSVListController)
)

manageSshRoutes.put(
  '/update',
  requireAdminAuth,
  updateSVListValidator,
  wrapRequestHandler(updateSVListController)
)

manageSshRoutes.delete(
  '/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteSVListController)
)

export default manageSshRoutes
