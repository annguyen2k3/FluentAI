// Kiểm tra tên người dùng: chỉ được chứa chữ cái, số, dấu cách và dấu gạch dưới ( _ )
export const USERNAME_REGEX = /^[\p{L}\p{N}_ ]+$/u

// Kiểm tra số điện thoại, Ví dụ: 0123456789
export const PHONE_NUMBER_REGEX = /^0\d{9}$/

// Kiểm tra slug, chỉ được chứa chữ cái, số, dấu gạch dưới ( _ ) và dấu gạch ngang ( - )
export const SLUG_REGEX = /^[a-z0-9-]+$/
