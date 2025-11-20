export const COMMON_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  INFORM_SUCCESS: 'Thông tin hợp lệ',
  INFORM_FAILED: 'Thông tin không hợp lệ'
} as const

export const USER_MESSAGES = {
  USER_ID_INVALID: 'ID người dùng không hợp lệ',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  USER_BLOCKED: 'Người dùng đã bị khóa',
  USER_UNBLOCKED: 'Người dùng đã được mở khóa',
  USER_LOGOUT: 'Người dùng đã đăng xuất',
  USER_DELETED: 'Người dùng đã bị xóa',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGIN_FAILED: 'Đăng nhập thất bại',
  EMAIL_NOT_FOUND: 'Email không tồn tại',
  EMAIL_INVALID: 'Email không hợp lệ',
  EMAIL_EXISTS: 'Email đã tồn tại, vui lòng sử dụng email khác',
  GMAIL_NOT_VERIFIED: 'Email Google chưa được xác thực',
  PASSWORD_INCORRECT: 'Mật khẩu không chính xác',
  PASSWORD_REQUIRED: 'Mật khẩu không được để trống',
  PASSWORD_STRONG:
    'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt',
  PASSWORD_NOT_MATCH: 'Mật khẩu không trùng khớp',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  REGISTER_FAILED: 'Đăng ký thất bại',
  OTP_INVALID: 'Mã xác thực không hợp lệ',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công',
  USERNAME_LENGTH: 'Tên người dùng phải có ít nhất 1 ký tự và tối đa 50 ký tự',
  USERNAME_INVALID:
    'Tên người dùng chỉ được chứa chữ cái, số, dấu cách và dấu gạch dưới ( _ )',
  USERNAME_EXISTS: 'Tên người dùng đã tồn tại',
  DATE_OF_BIRTH_INVALID: 'Ngày sinh không hợp lệ',
  PHONE_NUMBER_INVALID: 'Số điện thoại không hợp lệ',
  GENDER_INVALID: 'Giới tính không hợp lệ',
  CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công',
  UPDATE_AVATAR_SUCCESS: 'Cập nhật ảnh đại diện thành công',
  UPDATE_PROFILE_SUCCESS: 'Cập nhật thông tin thành công'
} as const

export const PROPERTY_MESSAGES = {
  SLUG_NOT_FOUND: 'Slug không tồn tại',
  SLUG_INVALID: 'Slug không hợp lệ',
  LEVEL_NOT_FOUND: 'Cấp độ không tồn tại',
  TYPE_NOT_FOUND: 'Loại không tồn tại',
  TOPIC_NOT_FOUND: 'Chủ đề không tồn tại',
  TOPIC_INVALID: 'Chủ đề không hợp lệ',
  PAGE_INVALID: 'Trang không hợp lệ',
  LIMIT_INVALID: 'Số lượng không hợp lệ',
  STATUS_INVALID: 'Trạng thái không hợp lệ',
  SEARCH_INVALID: 'Từ khóa tìm kiếm không hợp lệ',
  SORT_INVALID: 'Sắp xếp không hợp lệ',
  DATE_INVALID: 'Ngày không hợp lệ'
} as const

export const WRITING_SENTENCE_MESSAGES = {
  ID_INVALID: 'ID không hợp lệ',
  WS_LIST_NOT_FOUND: 'Danh sách nội dung viết câu không tồn tại',
  TITLE_INVALID: 'Tiêu đề không hợp lệ',
  INIT_CHAT_FAILED: 'Khởi tạo chat thất bại',
  SENTENCE_VI_INVALID: 'Câu tiếng Việt không hợp lệ',
  USER_TRANSLATION_INVALID: 'Dịch của người dùng không hợp lệ',
  TOPIC_INVALID: 'Chủ đề không hợp lệ',
  LEVEL_INVALID: 'Cấp độ không hợp lệ',
  LIST_INVALID: 'Danh sách câu không hợp lệ',
  POS_INVALID: 'Vị trí không hợp lệ',
  SLUG_INVALID:
    'Slug không hợp lệ. Chỉ được chứa chữ cái, số, dấu gạch dưới ( _ ) và dấu gạch ngang ( - )',
  SLUG_EXISTS: 'Slug đã tồn tại',
  SLUG_LENGTH: 'Slug phải có ít nhất 1 ký tự và tối đa 50 ký tự',
  RANDOM_WS_NOT_FOUND: 'Không tìm thấy danh sách câu học',
  RANDOM_WS_SUCCESS: 'Danh sách câu học đã lấy thành công'
} as const

export const CATEGORIES_MESSAGES = {
  LEVEL_NOT_FOUND: 'Cấp độ không tồn tại',
  TYPE_NOT_FOUND: 'Loại không tồn tại',
  TOPIC_NOT_FOUND: 'Chủ đề không tồn tại',
  TITLE_REQUIRED: 'Tiêu đề không được để trống',
  TITLE_INVALID: 'Tiêu đề không hợp lệ',
  TITLE_LENGTH: 'Tiêu đề phải có ít nhất 1 ký tự và tối đa 50 ký tự',
  DESCRIPTION_REQUIRED: 'Mô tả không được để trống',
  DESCRIPTION_INVALID: 'Mô tả không hợp lệ',
  DESCRIPTION_LENGTH: 'Mô tả phải có ít nhất 1 ký tự và tối đa 255 ký tự',
  FA_CLASS_ICON_INVALID: 'Class icon FontAwesome không hợp lệ',
  POS_INVALID: 'Vị trí không hợp lệ',
  SLUG_INVALID:
    'Slug không hợp lệ. Chỉ được chứa chữ cái, số, dấu gạch dưới ( _ ) và dấu gạch ngang ( - )',
  SLUG_LENGTH: 'Slug phải có ít nhất 1 ký tự và tối đa 50 ký tự',
  SLUG_EXISTS: 'Slug đã tồn tại'
} as const
