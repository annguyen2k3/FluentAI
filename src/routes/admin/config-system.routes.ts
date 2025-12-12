import { Router } from 'express'
import {
  renderConfigScoreController,
  updateConfigScoreController
} from '~/controllers/admin/config-score.controllers'
import {
  renderConfigPricingCreditController,
  updateConfigPricingCreditController
} from '~/controllers/admin/config-pricing-credit.controllers'
import {
  renderConfigCreditUsageController,
  updateConfigCreditUsageController
} from '~/controllers/admin/config-credit-usage.controllers'
import { requireAdminAuth } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const configSystemRoutes = Router()

// GET /admin/configs/score
// Description: Render config score page
configSystemRoutes.get(
  '/score',
  requireAdminAuth,
  wrapRequestHandler(renderConfigScoreController)
)

// PUT /admin/configs/score
// Description: Update config score
// Body: { [UserScoreType]: number }
configSystemRoutes.put(
  '/score',
  requireAdminAuth,
  wrapRequestHandler(updateConfigScoreController)
)

// GET /admin/configs/pricing-credit
// Description: Render config pricing credit page
configSystemRoutes.get(
  '/pricing-credit',
  requireAdminAuth,
  wrapRequestHandler(renderConfigPricingCreditController)
)

// PUT /admin/configs/pricing-credit
// Description: Update config pricing credit
// Body: Array<{ price: number; discount: number; credit: number }>
configSystemRoutes.put(
  '/pricing-credit',
  requireAdminAuth,
  wrapRequestHandler(updateConfigPricingCreditController)
)

// GET /admin/configs/credit-usage
// Description: Render config credit usage page
configSystemRoutes.get(
  '/credit-usage',
  requireAdminAuth,
  wrapRequestHandler(renderConfigCreditUsageController)
)

// PUT /admin/configs/credit-usage
// Description: Update config credit usage
// Body: { [CreditUsageType]: number }
configSystemRoutes.put(
  '/credit-usage',
  requireAdminAuth,
  wrapRequestHandler(updateConfigCreditUsageController)
)

export default configSystemRoutes
