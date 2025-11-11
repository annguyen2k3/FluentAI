export const COMMON_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  INFORM_SUCCESS: 'Thông tin hợp lệ',
  INFORM_FAILED: 'Thông tin không hợp lệ',
} as const

export const USER_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  EMAIL_NOT_FOUND: 'Email không tồn tại',
  EMAIL_INVALID: 'Email không hợp lệ',
  EMAIL_EXISTS: 'Email đã tồn tại, vui lòng sử dụng email khác',
  GMAIL_NOT_VERIFIED: 'Email Google chưa được xác thực',
  PASSWORD_INCORRECT: 'Mật khẩu không chính xác',
  PASSWORD_REQUIRED: 'Mật khẩu không được để trống',
  PASSWORD_STRONG: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt',
  PASSWORD_NOT_MATCH: 'Mật khẩu không trùng khớp',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  REGISTER_FAILED: 'Đăng ký thất bại',
  OTP_INVALID: 'Mã xác thực không hợp lệ',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công',
  USERNAME_LENGTH: 'Tên người dùng phải có ít nhất 1 ký tự và tối đa 50 ký tự',
  USERNAME_INVALID: 'Tên người dùng chỉ được chứa chữ cái, số, dấu cách và dấu gạch dưới ( _ )',
  USERNAME_EXISTS: 'Tên người dùng đã tồn tại',
  DATE_OF_BIRTH_INVALID: 'Ngày sinh không hợp lệ',
  PHONE_NUMBER_INVALID: 'Số điện thoại không hợp lệ',
  GENDER_INVALID: 'Giới tính không hợp lệ',
  CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công',
  UPDATE_AVATAR_SUCCESS: 'Cập nhật ảnh đại diện thành công',
  UPDATE_PROFILE_SUCCESS: 'Cập nhật thông tin thành công',
} as const 

export const PROPERTY_MESSAGES = {
  SLUG_NOT_FOUND: 'Slug không tồn tại',
  SLUG_INVALID: 'Slug không hợp lệ',
} as const

export const WRITING_SENTENCE_MESSAGES = {
  INIT_CHAT_FAILED: 'Khởi tạo chat thất bại',
  SENTENCE_VI_INVALID: 'Câu tiếng Việt không hợp lệ',
  USER_TRANSLATION_INVALID: 'Dịch của người dùng không hợp lệ',
  TOPIC_INVALID: 'Chủ đề không hợp lệ',
} as const