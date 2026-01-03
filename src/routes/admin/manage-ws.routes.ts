import { Router } from 'express'
import {
  createWSListController,
  deleteWSListController,
  downloadWSTemplateController,
  getListWsController,
  importWSListController,
  renderImportWsController,
  renderManageWsController,
  saveImportedWSListController,
  updateWSListController
} from '~/controllers/admin/manage-ws.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import {
  createWSListValidator,
  updateWSListValidator
} from '~/middlewares/writing-sentence.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const manageWsRoutes = Router()

// GET /admin/ws
// Description: Render page manage ws
manageWsRoutes.get(
  '/',
  requireAdminAuth,
  wrapRequestHandler(renderManageWsController)
)

// GET /admin/ws/list
// Description: Get list of ws
// Query: page, limit, level, topic,
manageWsRoutes.get(
  '/list',
  requireAdminAuth,
  wrapRequestHandler(getListWsController)
)

// POST /admin/ws/create
// Description: Create ws
// Body: {title: string, topic: string, level: string, list: SentenceWriteType[], pos?: number, slug?: string}
manageWsRoutes.post(
  '/create',
  requireAdminAuth,
  createWSListValidator,
  wrapRequestHandler(createWSListController)
)

// PUT /admin/ws/update
// Description: Update ws
// Body: {id: string, title: string, topic: string, level: string, list: SentenceWriteType[], pos: number, slug: string}
manageWsRoutes.put(
  '/update',
  requireAdminAuth,
  updateWSListValidator,
  wrapRequestHandler(updateWSListController)
)

// DELETE /admin/ws/delete
// Description: Delete ws
// Body: {id: string}
manageWsRoutes.delete(
  '/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteWSListController)
)

// GET /admin/ws/import
// Description: Render page import ws
manageWsRoutes.get(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(renderImportWsController)
)

// GET /admin/ws/export-template
// Description: Download file Excel template
manageWsRoutes.get(
  '/export-template',
  requireAdminAuth,
  wrapRequestHandler(downloadWSTemplateController)
)

// POST /admin/ws/import
// Description: Import file Excel và parse dữ liệu (chưa lưu vào DB)
// Body: FormData with 'excelFile' field
manageWsRoutes.post(
  '/import',
  requireAdminAuth,
  wrapRequestHandler(importWSListController)
)

// POST /admin/ws/import/save
// Description: Lưu dữ liệu đã import vào hệ thống
// Body: { wsLists: WSList[] }
manageWsRoutes.post(
  '/import/save',
  requireAdminAuth,
  wrapRequestHandler(saveImportedWSListController)
)

export default manageWsRoutes
