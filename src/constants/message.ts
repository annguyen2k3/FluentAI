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
} as const 