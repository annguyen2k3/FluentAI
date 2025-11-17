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
  UPDATE_AVATAR_PROFILE: `${apiUrl}/users/profile/avatar`,
  GET_WS_LIST: `${apiUrl}/writing-sentence/list`, // Get list of writing sentences
  POST_PRACTICE_WS: `${apiUrl}/writing-sentence/practice`, // Post practice writing sentence
  GET_COMPLETE_WS: `${apiUrl}/writing-sentence/practice/complete/{slug}`, // Get complete writing sentence
  POST_CUSTOM_TOPIC_PREVIEW_WS: `${apiUrl}/writing-sentence/custom-topic/preview`, // Post custom topic preview
  GET_PRACTICE_CUSTOM_TOPIC_WS: `${apiUrl}/writing-sentence/practice/custom-topic/{idPreview}`, // Get practice custom topic
  GET_WP_LIST: `${apiUrl}/writing-paragraph/list`, // Get list of writing paragraphs
  POST_PRACTICE_WP: `${apiUrl}/writing-paragraph/practice`, // Post practice writing paragraph

  // POST /writing-paragraph/custom-topic/preview
  // Description: Post custom topic preview
  // Body: {topic: string, level: string}
  POST_CUSTOM_TOPIC_PREVIEW_WP: `${apiUrl}/writing-paragraph/custom-topic/preview`, // Post custom topic preview

  // POST /writing-paragraph/preview-content
  // Description: Post preview content
  // Body: {content: string}
  POST_PREVIEW_CONTENT_WP: `${apiUrl}/writing-paragraph/preview-content` // Post preview content
}

const adminApiUrl = 'http://localhost:3000/admin'
export const AdminApiBreakpoint = {
  // POST /admin/auth/login
  // Description: Login admin
  // Body: { username: string, password: string }
  LOGIN: `${adminApiUrl}/auth/login`,

  // PUT /admin/auth/profile
  // Description: Update admin profile
  // Body: { username: string, email: string }
  UPDATE_PROFILE: `${adminApiUrl}/auth/profile`,

  // PUT /admin/auth/profile/change-password
  // Description: Change admin password
  // Body: { currentPassword: string, newPassword: string, confirmPassword: string }
  CHANGE_PASSWORD: `${adminApiUrl}/auth/profile/change-password`,

  // PATCH /admin/auth/profile/avatar
  // Description: Update admin avatar
  // Body: { images: File }
  UPDATE_AVATAR_PROFILE: `${adminApiUrl}/auth/profile/avatar`,

  // GET /admin/users/list
  // Description: Get list of users
  // Query: page, limit, status, search, sort, startDate, endDate
  GET_USERS_LIST: `${adminApiUrl}/users/list`,

  // POST /admin/users/lock
  // Description: Lock user
  // Body: { userId: string }
  LOCK_USER: `${adminApiUrl}/users/lock`,

  // POST /admin/users/unlock
  // Description: Unlock user
  // Body: { userId: string }
  UNLOCK_USER: `${adminApiUrl}/users/unlock`,

  // POST /admin/users/logout
  // Description: Logout user
  // Body: { userId: string }
  LOGOUT_USER: `${adminApiUrl}/users/logout`,

  // DELETE /admin/users/delete
  // Description: Delete user
  // Body: { userId: string }
  DELETE_USER: `${adminApiUrl}/users/delete`,

  // PUT /admin/users/update
  // Description: Update user manage
  // Body: { userId: string, username: string, email: string, dateOfBirth: string, phoneNumber: string, gender: string }
  UPDATE_USER_MANAGE: `${adminApiUrl}/users/update`
}
