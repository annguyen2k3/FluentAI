import { Router } from 'express'
import {
  getListWsController,
  renderManageWsController
} from '~/controllers/admin/manage-ws.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const manageWsRoutes = Router()

// GET /admin/ws
// Description: Render page manage ws
manageWsRoutes.get('/', requireAdminAuth, wrapRequestHandler(renderManageWsController))

// GET /admin/ws/list
// Description: Get list of ws
// Query: page, limit, level, topic,
manageWsRoutes.get('/list', requireAdminAuth, wrapRequestHandler(getListWsController))

export default manageWsRoutes
