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

  // GET /writing-sentence/list
  // Description: Get list of writing sentences
  // Query: level, topic, page, limit, search, sortKey, sortOrder
  GET_WS_LIST: `${apiUrl}/writing-sentence/list`,

  // GET /writing-sentence/random
  // Description: Get random writing sentence
  // Query: level, topic
  GET_RANDOM_WS: `${apiUrl}/writing-sentence/random`,

  POST_PRACTICE_WS: `${apiUrl}/writing-sentence/practice`, // Post practice writing sentence
  GET_COMPLETE_WS: `${apiUrl}/writing-sentence/practice/complete/{slug}`, // Get complete writing sentence
  POST_CUSTOM_TOPIC_PREVIEW_WS: `${apiUrl}/writing-sentence/custom-topic/preview`, // Post custom topic preview

  GET_PRACTICE_CUSTOM_TOPIC_WS: `${apiUrl}/writing-sentence/practice/custom-topic/{idPreview}`, // Get practice custom topic

  // DELETE /writing-sentence/practice/history/:slug
  // Description: Delete history practice writing sentence
  // Params: slug: string
  DELETE_HISTORY_PRACTICE_WS: `${apiUrl}/writing-sentence/practice/history/{slug}`,

  // GET /writing-paragraph/list
  // Description: Get list of writing paragraphs
  // Query: level, topic, type, page, limit, search, sortKey, sortOrder
  GET_WP_LIST: `${apiUrl}/writing-paragraph/list`,

  // POST /writing-paragraph/practice
  // Description: Post practice writing paragraph
  // Body: {level: string, topic: string, type: string}
  POST_PRACTICE_WP: `${apiUrl}/writing-paragraph/practice`, // Post practice writing paragraph

  // DELETE /writing-paragraph/practice/history/:slug
  // Description: Delete history practice writing paragraph
  // Params: slug: string
  DELETE_HISTORY_PRACTICE_WP: `${apiUrl}/writing-paragraph/practice/history/{slug}`,

  // POST /writing-paragraph/custom-topic/preview
  // Description: Post custom topic preview
  // Body: {topic: string, level: string}
  POST_CUSTOM_TOPIC_PREVIEW_WP: `${apiUrl}/writing-paragraph/custom-topic/preview`, // Post custom topic preview

  // POST /writing-paragraph/preview-content
  // Description: Post preview content
  // Body: {content: string}
  POST_PREVIEW_CONTENT_WP: `${apiUrl}/writing-paragraph/preview-content`, // Post preview content

  // GET /writing-paragraph/random
  // Description: Get random writing paragraph
  // Query: level, topic, type
  GET_RANDOM_WP: `${apiUrl}/writing-paragraph/random`,

  // GET /speaking-sentence/list
  // Description: Get list of speaking sentences
  // Query: level, topic, page, limit, search, sortKey, sortOrder
  GET_SS_LIST: `${apiUrl}/speaking-sentence/list`,

  // POST /speaking-sentence/practice/:slug/evaluate
  // Description: Evaluate speaking sentence
  // Body: FormData { enSentence: string, audio: File }
  POST_EVALUATE_SS: `${apiUrl}/speaking-sentence/practice/{slug}/evaluate`,

  // POST /speaking-sentence/practice/audio
  // Description: Generate audio for speaking sentence
  // Body: { text: string }
  POST_PRACTICE_SS_AUDIO: `${apiUrl}/speaking-sentence/practice/audio`,

  // DELETE /speaking-sentence/history/:slug
  // Description: Delete history speaking sentence
  // Query: slug
  DELETE_SS_HISTORY: `${apiUrl}/speaking-sentence/history/{slug}`,

  // POST /speaking-sentence/preview-topic
  // Description: Preview speaking sentence topic for user custom
  // Body: { description: string }
  POST_PREVIEW_SS_TOPIC: `${apiUrl}/speaking-sentence/preview-topic`,

  // POST /speaking-sentence/practice/custom-topic/evaluate
  // Description: Evaluate speaking sentence for custom topic
  // Body: FormData { enSentence: string, audio: File }
  POST_EVALUATE_SS_CUSTOM_TOPIC: `${apiUrl}/speaking-sentence/practice/custom-topic/evaluate`,

  // GET /speaking-shadowing/list
  // Description: Get list of speaking shadowing
  // Query: level, topic, page, limit, search, sortKey, sortOrder, status
  GET_SV_LIST: `${apiUrl}/speaking-shadowing/list`,

  // POST /speaking-shadowing/practice/:slug/evaluate
  // Description: Evaluate speaking shadowing
  // Params: slug: string
  // Headers: Content-Type: multipart/form-data
  // Body: audio: file, enSentence: string
  POST_EVALUATE_SV: `${apiUrl}/speaking-shadowing/practice/{slug}/evaluate`,

  // DELETE /speaking-shadowing/history/:slug
  // Description: Delete history speaking shadowing
  // Params: slug: string
  DELETE_SV_HISTORY: `${apiUrl}/speaking-shadowing/history/{slug}`,

  // GET /listening-video/list
  // Description: Get list video of listening video
  // Query: level, topic, page, limit, search, sortKey, sortOrder, status
  GET_LV_LIST: `${apiUrl}/listening-video/list`,

  // PUT /listening-video/update-status/:slug
  // Description: Update status of listening video
  // Params: slug: string
  // Body: status: StatusLesson
  UPDATE_LV_STATUS: `${apiUrl}/listening-video/update-status/{slug}`,

  // POST /payment/cod
  // Description: Payment COD
  // Method: POST
  // Body: { packageId: string }
  POST_PAYMENT_COD: `${apiUrl}/payment/cod`,

  // GET /share-document/list
  // Description: Get list of share documents
  // Query: page, limit, search, sortKey, sortOrder
  GET_SHARE_DOCUMENT_LIST: `${apiUrl}/share-document/list`,

  // POST /share-document/bookmark
  // Description: Bookmark a share document
  // Body: { shareDocumentId: string }
  POST_BOOKMARK_SHARE_DOCUMENT: `${apiUrl}/share-document/bookmark`,

  // POST /share-document/unbookmark
  // Description: Unbookmark a share document
  // Body: { shareDocumentId: string }
  POST_UNBOOKMARK_SHARE_DOCUMENT: `${apiUrl}/share-document/unbookmark`,

  // GET /users/bookmarks/list
  // Description: Get list of user bookmarks
  // Query: page, limit, search
  GET_USER_BOOKMARKS_LIST: `${apiUrl}/users/bookmarks/list`
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

  // GET /admin/statistics-reporting/users-overview/data
  // Description: Get statistics overview for users (summary + daily stats)
  // Query: type (all|active|blocked|new), startDate, endDate (YYYY-MM-DD)
  ADMIN_STATISTICS_USERS_OVERVIEW: `${adminApiUrl}/statistics-reporting/users-overview/data`,

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
  UPDATE_USER_MANAGE: `${adminApiUrl}/users/update`,

  // POST /admin/categories/levels
  // Description: Create level
  // Body: {title: string, description: string, fa_class_icon: string, slug: string, pos: number}
  CREATE_LEVEL: `${adminApiUrl}/categories/levels`,

  // PUT /admin/categories/levels
  // Description: Update level
  // Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
  UPDATE_LEVEL: `${adminApiUrl}/categories/levels`,

  // DELETE /admin/categories/levels
  // Description: Delete level
  // Body: {id: string}
  DELETE_LEVEL: `${adminApiUrl}/categories/levels`,

  // POST /admin/categories/types
  // Description: Create type
  // Body: {title: string, description: string, fa_class_icon: string, slug: string, pos: number}
  CREATE_TYPE: `${adminApiUrl}/categories/types`,

  // PUT /admin/categories/types
  // Description: Update type
  // Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
  UPDATE_TYPE: `${adminApiUrl}/categories/types`,

  // DELETE /admin/categories/types
  // Description: Delete type
  // Body: {id: string}
  DELETE_TYPE: `${adminApiUrl}/categories/types`,

  // POST /admin/categories/topics
  // Description: Create topic
  // Body: {title: string, description: string, fa_class_icon: string, slug: string, pos: number}
  CREATE_TOPIC: `${adminApiUrl}/categories/topics`,

  // PUT /admin/categories/topics
  // Description: Update topic
  // Body: {id: string, title: string, description: string, fa_class_icon: string, slug: string, pos: number}
  UPDATE_TOPIC: `${adminApiUrl}/categories/topics`,

  // DELETE /admin/categories/topics
  // Description: Delete topic
  // Body: {id: string}
  DELETE_TOPIC: `${adminApiUrl}/categories/topics`,

  // GET /admin/ws/list
  // Description: Get list of ws
  // Query: page, limit, level, topic
  GET_WS_LIST: `${adminApiUrl}/ws/list`,

  // POST /admin/ws/create
  // Description: Create ws
  // Body: {title: string, topic: string, level: string, list: SentenceWriteType[], pos?: number, slug?: string}
  CREATE_WS_LIST: `${adminApiUrl}/ws/create`,

  // PUT /admin/ws/update
  // Description: Update ws
  // Body: {id: string, title: string, topic: string, level: string, list: SentenceWriteType[], pos: number, slug: string}
  UPDATE_WS_LIST: `${adminApiUrl}/ws/update`,

  // DELETE /admin/ws/delete
  // Description: Delete ws
  // Body: {id: string}
  DELETE_WS_LIST: `${adminApiUrl}/ws/delete`,

  // GET /admin/wp/list
  // Description: Get list of wp
  // Query: page, limit, level, topic, type, search, sortKey, sortOrder
  GET_WP_LIST: `${adminApiUrl}/wp/list`,

  // POST /admin/wp/create
  // Description: Create wp
  // Body: {title: string, topic: string, level: string, type: string, content: string, hint?: VocabularyHintType[], pos?: number, slug?: string}
  CREATE_WP_LIST: `${adminApiUrl}/wp/create`,

  // PUT /admin/wp/update
  // Description: Update wp
  // Body: {id: string, title: string, topic: string, level: string, type: string, content: string, hint?: VocabularyHintType[], pos: number, slug: string}
  UPDATE_WP_LIST: `${adminApiUrl}/wp/update`,

  // DELETE /admin/wp/delete
  // Description: Delete wp
  // Body: {id: string}
  DELETE_WP_LIST: `${adminApiUrl}/wp/delete`,

  // GET /admin/statistics-reporting/revenue/data
  // Description: Get statistics revenue and system wallet
  // Query: startDate, endDate (YYYY-MM-DD)
  ADMIN_STATISTICS_REVENUE: `${adminApiUrl}/statistics-reporting/revenue/data`,

  // GET /admin/statistics-reporting/google-api/data
  // Description: Get statistics Google API requests from Cloud Monitoring
  // Query: startDate, endDate (YYYY-MM-DD)
  ADMIN_STATISTICS_GOOGLE_API: `${adminApiUrl}/statistics-reporting/google-api/data`,

  // PATCH /admin/users/wallet/edit
  // Description: Edit wallet user
  // Body: {userId: string, amount: number, titleMail: string, htmlDescriptionMail: string}
  EDIT_WALLET_USER: `${adminApiUrl}/users/wallet/edit`,

  // GET /admin/speaking-sentence/list
  // Description: Get list of ss
  // Query: page, limit, level, topic, search, sortKey, sortOrder
  GET_SS_LIST: `${adminApiUrl}/speaking-sentence/list`,

  // POST /admin/speaking-sentence/create
  // Description: Create ss
  // Body: {title: string, topic: string, level: string, list: SentenceSpeakingType[], pos?: number, slug?: string}
  CREATE_SS_LIST: `${adminApiUrl}/speaking-sentence/create`,

  // PUT /admin/speaking-sentence/update
  // Description: Update ss
  // Body: {id: string, title: string, topic: string, level: string, list: SentenceSpeakingType[], pos: number, slug: string}
  UPDATE_SS_LIST: `${adminApiUrl}/speaking-sentence/update`,

  // DELETE /admin/speaking-sentence/delete
  // Description: Delete ss
  // Body: {id: string}
  DELETE_SS_LIST: `${adminApiUrl}/speaking-sentence/delete`,

  // GET /admin/speaking-shadowing/list
  // Description: Get list of sv shadowing
  // Query: page, limit, level, topic, search, sortKey, sortOrder, isActive
  GET_SV_LIST: `${adminApiUrl}/speaking-shadowing/list`,

  // POST /admin/speaking-shadowing/create
  // Description: Create sv shadowing
  // Body: {title: string, topic: string, level: string, videoUrl: string, thumbnailUrl?: string, transcript: ShadowingSentenceType[], pos?: number, slug?: string, isActive?: boolean}
  CREATE_SV_LIST: `${adminApiUrl}/speaking-shadowing/create`,

  // PUT /admin/speaking-shadowing/update
  // Description: Update sv shadowing
  // Body: {id: string, title: string, topic: string, level: string, videoUrl: string, thumbnailUrl?: string, transcript: ShadowingSentenceType[], pos: number, slug: string, isActive?: boolean}
  UPDATE_SV_LIST: `${adminApiUrl}/speaking-shadowing/update`,

  // DELETE /admin/speaking-shadowing/delete
  // Description: Delete sv shadowing
  // Body: {id: string}
  DELETE_SV_LIST: `${adminApiUrl}/speaking-shadowing/delete`,

  // GET /admin/listening-video/list
  // Description: Get list of lv
  // Query: page, limit, level, topic, search, sortKey, sortOrder, isActive
  GET_LV_LIST: `${adminApiUrl}/listening-video/list`,

  // POST /admin/listening-video/create
  // Description: Create lv
  // Body: {title: string, level: string, topics: string[], videoUrl: string, thumbnailUrl?: string, transcript: TranscriptSentenceType[], questions: QuestionType[], time?: number, description?: string, pos?: number, slug?: string, isActive?: boolean}
  CREATE_LV_LIST: `${adminApiUrl}/listening-video/create`,

  // PUT /admin/listening-video/update
  // Description: Update lv
  // Body: {id: string, title: string, level: string, topics: string[], videoUrl: string, thumbnailUrl?: string, transcript: TranscriptSentenceType[], questions: QuestionType[], time?: number, description?: string, pos: number, slug: string, isActive?: boolean}
  UPDATE_LV_LIST: `${adminApiUrl}/listening-video/update`,

  // DELETE /admin/listening-video/delete
  // Description: Delete lv
  // Body: {id: string}
  DELETE_LV_LIST: `${adminApiUrl}/listening-video/delete`,

  // PUT /admin/configs/score
  // Description: Update system score
  // Body: { [UserScoreType]: number }
  UPDATE_SCORE: `${adminApiUrl}/configs/score`,

  // PUT /admin/configs/pricing-credit
  // Description: Update system pricing credit packages
  // Body: Array<{ price: number, discount: number, credit: number }>
  UPDATE_PRICING_CREDIT: `${adminApiUrl}/configs/pricing-credit`,

  // PUT /admin/configs/credit-usage
  // Description: Update system credit usage
  // Body: { [CreditUsageType]: number }
  UPDATE_CREDIT_USAGE: `${adminApiUrl}/configs/credit-usage`,

  // POST /admin/ai-llm/config/set-active
  // Description: Set active config
  // Body: { configId: string }
  SET_ACTIVE_CONFIG: `${adminApiUrl}/ai-llm/config/set-active`,

  // POST /admin/ai-llm/config/create
  // Description: Create new config
  // Body: { name: string, description?: string, model: string, config: { responseMimeType: string, temperature: number, maxOutputTokens?: number, topP?: number } }
  CREATE_CONFIG: `${adminApiUrl}/ai-llm/config/create`,

  // PUT /admin/ai-llm/config/update
  // Description: Update config
  // Body: { configId: string, name?: string, description?: string, model?: string, config?: { responseMimeType?: string, temperature?: number, maxOutputTokens?: number, topP?: number } }
  UPDATE_CONFIG: `${adminApiUrl}/ai-llm/config/update`,

  // POST /admin/ai-llm/config/duplicate
  // Description: Duplicate config
  // Body: { configId: string }
  DUPLICATE_CONFIG: `${adminApiUrl}/ai-llm/config/duplicate`,

  // DELETE /admin/ai-llm/config/delete
  // Description: Delete config
  // Body: { configId: string }
  DELETE_CONFIG: `${adminApiUrl}/ai-llm/config/delete`,

  // GET /admin/ai-llm/config/test/{configId}
  // Description: Test config
  // Params: { configId: string }
  TEST_CONFIG: `${adminApiUrl}/ai-llm/config/test/{configId}`,

  // POST /admin/ai-llm/prompt/set-active
  // Description: Set active prompt
  // Body: { promptId: string }
  SET_ACTIVE_PROMPT: `${adminApiUrl}/ai-llm/prompt/set-active`,

  // POST /admin/ai-llm/prompt/create
  // Description: Create prompt
  // Body: { title: string, description?: string, feature: string, feature_type: string, content: string, replace_variables?: string[], isActive?: boolean }
  CREATE_PROMPT: `${adminApiUrl}/ai-llm/prompt/create`,

  // PUT /admin/ai-llm/prompt/update
  // Description: Update prompt
  // Body: { promptId: string, title?: string, description?: string, content?: string, replace_variables?: string[], isActive?: boolean }
  UPDATE_PROMPT: `${adminApiUrl}/ai-llm/prompt/update`,

  // DELETE /admin/ai-llm/prompt/delete
  // Description: Delete prompt
  // Body: { promptId: string }
  DELETE_PROMPT: `${adminApiUrl}/ai-llm/prompt/delete`,

  // GET /admin/info-website
  // Description: Get info website
  GET_INFO_WEBSITE: `${adminApiUrl}/info-website`,

  // PUT /admin/info-website
  // Description: Update info website
  // Body: { name: string, description: string, url_logo: string, phone_number: string, email: string, address: string }
  UPDATE_INFO_WEBSITE: `${adminApiUrl}/info-website`,

  // GET /admin/share-document/list
  // Description: Get list of share documents
  // Query: page, limit, search, sortKey, sortOrder, isActive
  GET_SHARE_DOCUMENT_LIST: `${adminApiUrl}/share-document/list`,

  // POST /admin/share-document/create
  // Description: Create share document
  // Body: { title: string, author?: string, content: string, isActive?: boolean }
  CREATE_SHARE_DOCUMENT: `${adminApiUrl}/share-document/create`,

  // PUT /admin/share-document/update
  // Description: Update share document
  // Body: { documentId: string, title?: string, author?: string, content?: string, isActive?: boolean }
  UPDATE_SHARE_DOCUMENT: `${adminApiUrl}/share-document/update`,

  // DELETE /admin/share-document/delete
  // Description: Delete share document
  // Body: { documentId: string }
  DELETE_SHARE_DOCUMENT: `${adminApiUrl}/share-document/delete`,

  // POST /admin/share-document/duplicate
  // Description: Duplicate share document
  // Body: { documentId: string }
  DUPLICATE_SHARE_DOCUMENT: `${adminApiUrl}/share-document/duplicate`,

  // POST /admin/media/upload-image-to-tiny-mce
  // Description: Upload image to TinyMCE
  // Body: { images: File }
  UPLOAD_IMAGE_TO_TINY_MCE: `${adminApiUrl}/media/upload-image-to-tiny-mce`
}
