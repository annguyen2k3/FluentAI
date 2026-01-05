import { Router } from 'express'
import {
  createSVListController,
  deleteSVListController,
  downloadSVTemplateController,
  getListSvController,
  importSVListController,
  renderImportSshController,
  renderManageSshController,
  saveImportedSVListController,
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

manageSshRoutes.get(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(renderImportSshController)
)

manageSshRoutes.get(
  '/export-template',
  requireAdminAuth,
  wrapRequestHandler(downloadSVTemplateController)
)

manageSshRoutes.post(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(importSVListController)
)

manageSshRoutes.post(
  '/import/save',
  requireAdminAuth,
  wrapRequestHandler(saveImportedSVListController)
)

export default manageSshRoutes
