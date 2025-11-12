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
  GET_WP_LIST: `${apiUrl}/writing-paragraph/list` // Get list of writing paragraphs
}
