import { Router } from 'express'
import {
  createWSListController,
  getListWsController,
  renderManageWsController,
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

export default manageWsRoutes
