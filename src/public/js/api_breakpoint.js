const apiUrl = 'http://localhost:3000'

export const ApiBreakpoint = {
  // Authentication API
  LOGIN: `${apiUrl}/users/login`,
  REGISTER: `${apiUrl}/users/register`,
  VERIFY_EMAIL: `${apiUrl}/users/verify-email`,
  FORGOT_PASSWORD_EMAIL: `${apiUrl}/users/forgot-password/email`,
  FORGOT_PASSWORD_OTP: `${apiUrl}/users/forgot-password/otp`,
  FORGOT_PASSWORD_RESET: `${apiUrl}/users/forgot-password/reset`,
  UPDATE_PROFILE: `${apiUrl}/users/profile`,
  CHANGE_PASSWORD: `${apiUrl}/users/profile/change-password`,
  UPDATE_AVATAR_PROFILE: `${apiUrl}/users/profile/avatar`
}
