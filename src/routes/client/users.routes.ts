import { Router } from 'express'
import {
  getLoginController,
  loginController,
  googleOAuthStartController,
  googleOAuthCallbackController,
  getRegisterController,
  registerController,
  getVerifyEmailController,
  verifyEmailController,
  getForgotPasswordController,
  forgotPasswordEmailController,
  getForgotPasswordOTPController,
  forgotPasswordOTPController,
  forgotPasswordResetController,
  getForgotPasswordResetController,
  getProfileController,
  updateProfileController,
  changePasswordController,
  logoutController,
  updateAvatarProfileController,
  getHistoryController
} from '~/controllers/client/users.controllers'
import {
  changePasswordValidator,
  forgotPasswordEmailValidator,
  forgotPasswordOTPValidator,
  forgotPasswordResetValidator,
  loginValidator,
  registerValidator,
  requireAuth,
  updateProfileValidator,
  verifyEmailValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const userRoutes = Router()

// Description: Render login page
// Path: /users/login
// Method: GET
userRoutes.get('/login', getLoginController)

// Description: Logout user
// Path: /users/logout
// Method: GET
userRoutes.get('/logout', requireAuth, wrapRequestHandler(logoutController))

// Description: Login user with email and password
// Path: /users/login
// Method: POST
// Body: { email: string, password: string }
userRoutes.post('/login', loginValidator, wrapRequestHandler(loginController))

// Description: Render register page
// Path: /users/register
// Method: GET
userRoutes.get('/register', wrapRequestHandler(getRegisterController))

// Description: Register user with email and password
// Path: /users/register
// Method: POST
// Body: { email: string, password: string, passwordConfirm: string }
userRoutes.post(
  '/register',
  registerValidator,
  wrapRequestHandler(registerController)
)

// Description: Render verify email page after register [OTP]
// Path: /users/verify-email
// Method: GET
userRoutes.get('/verify-email', wrapRequestHandler(getVerifyEmailController))

// Description: Verify email with email and password
// Path: /users/verify-email
// Method: POST
// Body: { otp: string }
userRoutes.post(
  '/verify-email',
  verifyEmailValidator,
  wrapRequestHandler(verifyEmailController)
)

// Description: Render Google OAuth start page
// Path: /users/oauth/google
// Method: GET
userRoutes.get('/oauth/google', wrapRequestHandler(googleOAuthStartController))

// Description: Render Google OAuth callback page
// Path: /users/oauth/google/callback
// Method: GET
userRoutes.get(
  '/oauth/google/callback',
  wrapRequestHandler(googleOAuthCallbackController)
)

// Description: Render forgot password page typing email address
// Path: /users/forgot-password
// Method: GET
userRoutes.get(
  '/forgot-password',
  wrapRequestHandler(getForgotPasswordController)
)

// Description: Forgot password with email address
// Path: /users/forgot-password/email
// Method: POST
// Body: { email: string }
userRoutes.post(
  '/forgot-password/email',
  forgotPasswordEmailValidator,
  wrapRequestHandler(forgotPasswordEmailController)
)

// Description: Render forgot password OTP page
// Path: /users/forgot-password/otp
// Method: GET
userRoutes.get(
  '/forgot-password/otp',
  wrapRequestHandler(getForgotPasswordOTPController)
)

// Description: Confirm OTP for forgot password
// Path: /users/forgot-password/otp
// Method: POST
// Body: { otp: string }
userRoutes.post(
  '/forgot-password/otp',
  forgotPasswordOTPValidator,
  wrapRequestHandler(forgotPasswordOTPController)
)

// Description: Render forgot password reset page
// Path: /users/forgot-password/reset-password
// Method: GET
userRoutes.get(
  '/forgot-password/reset',
  wrapRequestHandler(getForgotPasswordResetController)
)

// Description: Reset password for forgot password
// Path: /users/forgot-password/reset
// Method: POST
// Body: { password: string, passwordConfirm: string }
userRoutes.post(
  '/forgot-password/reset',
  forgotPasswordResetValidator,
  wrapRequestHandler(forgotPasswordResetController)
)

// Description: Render profile page
// Path: /users/profile
// Method: GET
userRoutes.get(
  '/profile',
  requireAuth,
  wrapRequestHandler(getProfileController)
)

// Description: Update profile
// Path: /users/profile
// Method: PUT
// Body: { username: string, dateOfBirth: string, phone: string, gender: string }
userRoutes.put(
  '/profile',
  requireAuth,
  updateProfileValidator,
  wrapRequestHandler(updateProfileController)
)

// Description: Change password
// Path: /users/profile/change-password
// Method: PUT
// Body: { oldPassword: string, newPassword: string, confirmPassword: string }
userRoutes.put(
  '/profile/change-password',
  requireAuth,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

// Description: Update avatar
// Path: /users/profile/avatar
// Method: PATCH
// Body: { avatar: string }
userRoutes.patch(
  '/profile/avatar',
  requireAuth,
  wrapRequestHandler(updateAvatarProfileController)
)

// GET /users/history
// Method: GET
// Query: { month: string, year: string }
userRoutes.get(
  '/history',
  requireAuth,
  wrapRequestHandler(getHistoryController)
)

export default userRoutes
