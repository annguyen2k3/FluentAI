import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/constants/enum"

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface LoginReqBody {
  email: string,
  password: string
}