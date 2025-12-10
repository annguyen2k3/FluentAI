import { Router } from 'express'
import {
  checkPaymentController,
  paymentCodController
} from '~/controllers/client/payment.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'

const paymentRoutes = Router()

// POST /payment/cod
// Description: Payment COD
// Method: POST
// Body: { packageId: string }
paymentRoutes.post(
  '/cod',
  requireAuth,
  wrapRequestHandler(paymentCodController)
)

paymentRoutes.get('/check-payment', wrapRequestHandler(checkPaymentController))

export default paymentRoutes
