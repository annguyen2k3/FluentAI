import { Router } from 'express'
import {
  renderConfigGeneralController,
  setActiveConfigController,
  updateConfigController,
  duplicateConfigController,
  deleteConfigController,
  createConfigController,
  testActiveConfigController
} from '~/controllers/admin/ai-llm.controller'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const aiLLMRoutes = Router()

// GET /admin/ai-llm/config-general
// Description: Render config general page
aiLLMRoutes.get(
  '/config-general',
  requireAdminAuth,
  wrapRequestHandler(renderConfigGeneralController)
)

// POST /admin/ai-llm/config/set-active
// Description: Set active config
// Body: { configId: string }
aiLLMRoutes.post(
  '/config/set-active',
  requireAdminAuth,
  wrapRequestHandler(setActiveConfigController)
)

// POST /admin/ai-llm/config/create
// Description: Create new config
// Body: { name: string, description: string, model: string, config: { responseMimeType: string, temperature: number, maxOutputTokens: number, topP: number } }
aiLLMRoutes.post(
  '/config/create',
  requireAdminAuth,
  wrapRequestHandler(createConfigController)
)

// PUT /admin/ai-llm/config/update
// Description: Update config
// Body: { configId: string, name: string, description: string, model: string, config: { responseMimeType: string, temperature: number, maxOutputTokens: number, topP: number } }
aiLLMRoutes.put(
  '/config/update',
  requireAdminAuth,
  wrapRequestHandler(updateConfigController)
)

// POST /admin/ai-llm/config/duplicate
// Description: Duplicate config
// Body: { configId: string }
aiLLMRoutes.post(
  '/config/duplicate',
  requireAdminAuth,
  wrapRequestHandler(duplicateConfigController)
)

// DELETE /admin/ai-llm/config/delete
// Description: Delete config
// Body: { configId: string }
aiLLMRoutes.delete(
  '/config/delete',
  requireAdminAuth,
  wrapRequestHandler(deleteConfigController)
)

// GET /admin/ai-llm/config/test/{configId}
// Description: Test config
// Params: { configId: string }
aiLLMRoutes.get(
  '/config/test/:configId',
  requireAdminAuth,
  wrapRequestHandler(testActiveConfigController)
)

export default aiLLMRoutes
