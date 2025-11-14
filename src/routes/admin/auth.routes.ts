import { Request, Response, Router } from 'express'
import {
  getLoginController,
  loginController,
  logoutController,
  getProfileController,
  updateProfileController,
  changePasswordController,
  updateAvatarProfileController
} from '~/controllers/admin/auth.controllers'
import { requireAdminAuth, updateProfileValidator, changePasswordValidator } from '~/middlewares/admin.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const authRoutes = Router()

// GET /admin/auth/login
authRoutes.get('/login', getLoginController)

// POST /admin/auth/login
// Description: Login admin
// Body: { username: string, password: string }
authRoutes.post('/login', wrapRequestHandler(loginController))

// GET /admin/auth/logout
// Description: Logout admin
authRoutes.get('/logout', wrapRequestHandler(logoutController))

// GET /admin/auth/profile
// Description: Get admin profile
authRoutes.get('/profile', requireAdminAuth, wrapRequestHandler(getProfileController))

// PUT /admin/auth/profile
// Description: Update admin profile
// Body: { username: string, email: string }
authRoutes.put('/profile', requireAdminAuth, updateProfileValidator, wrapRequestHandler(updateProfileController))

// PUT /admin/auth/profile/change-password
// Description: Change admin password
// Body: { currentPassword: string, newPassword: string, confirmPassword: string }
authRoutes.put(
  '/profile/change-password',
  requireAdminAuth,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

// PATCH /admin/auth/profile/avatar
// Description: Update admin avatar
// Body: { images: File }
authRoutes.patch('/profile/avatar', requireAdminAuth, wrapRequestHandler(updateAvatarProfileController))

export default authRoutes
