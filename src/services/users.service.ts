import { signToken } from "~/utils/jwt";
import { databaseService } from "./database.service"
import { TokenType, VerifyEmailType } from "~/constants/enum";
import { config } from "dotenv"
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { ObjectId } from "mongodb";
import axios from "axios";
import { USER_MESSAGES } from "~/constants/message";
import { ErrorWithStatus } from "~/models/Errors";
import { HttpStatus } from "~/constants/httpStatus";
import User from "~/models/schemas/users.schema";
import md5 from "md5";
import { generateOTP } from "~/utils/random";
import OTPVerifyEmail from "~/models/schemas/otp-verify-email.schema";

config()

class UserService {
    private signAccessToken(user_id: string) {
        return signToken({
          payload: {
            user_id,
            token_type: TokenType.AccessToken,
          },
          privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
          options: {
            expiresIn: '15M'
          }
        })
    }
    
    private signRefreshToken(user_id: string) {
        return signToken({
            payload: {
            user_id,
            token_type: TokenType.RefreshToken,
            },
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {
            expiresIn: '100D'
            }
        })
    }

    private signAccessAndRefreshToken(user_id: string) {
        return Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
    }

    async login(user_id: string) {
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
    
        await databaseService.refreshTokens.insertOne(
          new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
        )
    
        return {
          access_token,
          refresh_token
        }
    }

    async register(email: string, password: string) {

      const passwordHash = md5(password)

      const user_id = new ObjectId()

      await databaseService.users.insertOne(new User({ _id: user_id, email, password:passwordHash }))

      const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())

      return {
        access_token,
        refresh_token
      } as {
        access_token: string,
        refresh_token: string,
      }
    }

    async checkEmailExists(email: string) {
        const isExists = await databaseService.users.findOne({ email })
        return Boolean(isExists)
    }

    // src/services/users.service.ts
    private async getOauthGoogleToken(code: string) {
      const body = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || ''
      }).toString()

      const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      return data as { access_token: string; id_token: string }
    }

    private async getGoogleUserInfo(access_token: string, id_token: string) {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      })
      return data as {
        sub: string
        name: string
        given_name: string
        family_name: string
        picture: string
        email: string
        email_verified: boolean
      }
    }

    async oauth(code: string) {
      const { access_token, id_token } = await this.getOauthGoogleToken(code)
      const userInfo = await this.getGoogleUserInfo(access_token, id_token)
  
      if (!userInfo.email_verified) {
        throw new ErrorWithStatus(USER_MESSAGES.GMAIL_NOT_VERIFIED, HttpStatus.BAD_REQUEST)
      }
      // Kiểm tra xem người dùng đã đăng ký chưa
      const user = await databaseService.users.findOne({ email: userInfo.email })
      if (user) {
        // Nếu đã đăng ký, đăng nhập và trả về token
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user._id.toString())
        await databaseService.refreshTokens.insertOne(
          new RefreshToken({ user_id: new ObjectId(user?._id), token: refresh_token })
        )
        return {
          access_token,
          refresh_token,
          new_user: 0
        }
      } else {
        // Nếu chưa đăng ký, tạo mới người dùng
        const password = Math.random().toString(36).substring(2, 15) // Tạo mật khẩu ngẫu nhiên
        const data = await databaseService.users.insertOne(new User({
          email: userInfo.email,
          password: md5(password),
          avatar: userInfo.picture,
        }))
        return {
          ...data,
          new_user: 1
        }
      }
    }

    async getGooogleAuthUrl() {
      const url = `https://accounts.google.com/o/oauth2/v2/auth`
      const query = {
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',
        response_type: 'code',
        scope: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ].join(' '),
      }
      
      const queryString = new URLSearchParams(query as Record<string, string>).toString()
      return `${url}?${queryString}`
    }

    async sendOTPVerifyEmail(email: string, type: VerifyEmailType) {
      const otp = generateOTP(4)
      console.log('OTP: ' + otp)
      await databaseService.otpVerifyEmail.insertOne(new OTPVerifyEmail({
        email,
        type,
        otp,
        expires_at: new Date(Date.now() + 1000 * 60 * 1)
      }))
    }

}

const userService = new UserService()
export default userService