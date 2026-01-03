import { Router } from 'express'
import {
  createWPListController,
  deleteWPListController,
  downloadWPTemplateController,
  getListWpController,
  importWPListController,
  renderImportWpController,
  renderManageWpController,
  saveImportedWPListController,
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

manageWpRoutes.get(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(renderImportWpController)
)

manageWpRoutes.get(
  '/export-template',
  requireAdminAuth,
  wrapRequestHandler(downloadWPTemplateController)
)

manageWpRoutes.post(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(importWPListController)
)

manageWpRoutes.post(
  '/import/save',
  requireAdminAuth,
  wrapRequestHandler(saveImportedWPListController)
)

export default manageWpRoutes
