import { Router } from 'express'
import {
  createSSListController,
  deleteSSListController,
  downloadSSTemplateController,
  getListSsController,
  importSSListController,
  renderImportSsController,
  renderManageSsController,
  saveImportedSSListController,
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

// GET /admin/speaking-sentence/import
manageSsRoutes.get(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(renderImportSsController)
)

// GET /admin/speaking-sentence/export-template
manageSsRoutes.get(
  '/export-template',
  requireAdminAuth,
  wrapRequestHandler(downloadSSTemplateController)
)

// POST /admin/speaking-sentence/import
manageSsRoutes.post(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(importSSListController)
)

// POST /admin/speaking-sentence/import/save
manageSsRoutes.post(
  '/import/save',
  requireAdminAuth,
  wrapRequestHandler(saveImportedSSListController)
)

export default manageSsRoutes
