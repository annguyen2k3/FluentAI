export const COMMON_MESSAGES = {
  VALIDATION_ERROR: 'Validation error'
} as const

export const USER_MESSAGE = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  EMAIL_NOT_FOUND: 'Email không tồn tại',
  EMAIL_INVALID: 'Email không hợp lệ',
  PASSWORD_INCORRECT: 'Mật khẩu không chính xác',
  PASSWORD_STRONG: 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt',
} as const 