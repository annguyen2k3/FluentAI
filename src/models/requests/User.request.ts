import { JwtPayload } from "jsonwebtoken"
import { GenderType, TokenType } from "~/constants/enum"

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LoginReqBody {
  email: string,
  password: string
}

export interface UpdateProfileReqBody {
  username: string,
  dateOfBirth: string,
  phoneNumber: string,
  gender: GenderType
}

export interface RegisterReqBody {
  email: string,
  password: string,
  passwordConfirm: string
}

export interface VerifyEmailReqBody {
  otp: string
}

export interface ForgotPasswordEmailReqBody {
  email: string
}

export interface ForgotPasswordOTPReqBody {
  otp: string
}

export interface ForgotPasswordResetReqBody {
  password: string,
  passwordConfirm: string
}

export interface ChangePasswordReqBody {
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
}