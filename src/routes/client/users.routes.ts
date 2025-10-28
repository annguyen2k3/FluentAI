import { Router } from 'express'
import { getLoginController, loginController, googleOAuthStartController, googleOAuthCallbackController, getRegisterController, registerController, getVerifyEmailController, verifyEmailController } from '~/controllers/client/users.controllers'
import { loginValidator, registerValidator, verifyEmailValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const userRoutes = Router()

userRoutes.get('/login', getLoginController)
userRoutes.post('/login', loginValidator, wrapRequestHandler(loginController))
userRoutes.get('/register', wrapRequestHandler(getRegisterController))
userRoutes.post('/register', registerValidator, wrapRequestHandler(registerController))
userRoutes.get('/verify-email', wrapRequestHandler(getVerifyEmailController))
userRoutes.post('/verify-email', verifyEmailValidator, wrapRequestHandler(verifyEmailController))

userRoutes.get('/oauth/google', wrapRequestHandler(googleOAuthStartController))
userRoutes.get('/oauth/google/callback', wrapRequestHandler(googleOAuthCallbackController))

export default userRoutes