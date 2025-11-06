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