import { Router } from 'express'
import { getLoginController, loginController } from '~/controllers/client/auth.controllers'
import { loginValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const authRoutes = Router()

authRoutes.get('/login', getLoginController)

authRoutes.post('/login', loginValidator, wrapRequestHandler(loginController))

export default authRoutes
