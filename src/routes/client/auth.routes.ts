import { Router } from 'express'
import { loginController } from '~/controllers/client/auth.controllers'
const authRoutes = Router()

authRoutes.get('/login', loginController)

export default authRoutes
