import { signToken } from '~/utils/jwt'
import { databaseService } from './database.service'
import {
  GenderType,
  TokenType,
  UserStatus,
  VerifyEmailType
} from '~/constants/enum'
import { config } from 'dotenv'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import axios from 'axios'
import { USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { HttpStatus } from '~/constants/httpStatus'
import User from '~/models/schemas/users.schema'
import md5 from 'md5'
import { generateOTP } from '~/utils/random'
import OTPVerifyEmail from '~/models/schemas/otp-verify-email.schema'
import { sendMail } from '~/utils/nodemailer'

config()

class UserService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '5M'
      }
    })
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '30D'
      }
    })
  }

  private signAccessAndRefreshToken(user_id: string) {
    return Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])
  }

  async login(user_id: string) {
    const [access_token, refresh_token] =
      await this.signAccessAndRefreshToken(user_id)

    await databaseService.refreshTokens.deleteOne({
      user_id: new ObjectId(user_id)
    })

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

    await databaseService.users.insertOne(
      new User({ _id: user_id, email, password: passwordHash })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id.toString()
    )

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: user_id, token: refresh_token })
    )

    return {
      access_token,
      refresh_token
    } as {
      access_token: string
      refresh_token: string
    }
  }

  async checkEmailExists(email: string, user_id?: string) {
    const query: Record<string, unknown> = { email }
    if (user_id) {
      query._id = { $ne: new ObjectId(user_id) }
    }
    const isExists = await databaseService.users.findOne(query)
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

    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      body,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    )

    return data as { access_token: string; id_token: string }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    )
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

  async oauth(code: string): Promise<{
    access_token: string
    refresh_token: string
    new_user: number
  }> {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)

    if (!userInfo.email_verified) {
      throw new ErrorWithStatus(
        USER_MESSAGES.GMAIL_NOT_VERIFIED,
        HttpStatus.BAD_REQUEST
      )
    }
    // Kiểm tra xem người dùng đã đăng ký chưa
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      // Nếu đã đăng ký, đăng nhập và trả về token
      const [access_token, refresh_token] =
        await this.signAccessAndRefreshToken(user._id.toString())
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user?._id),
          token: refresh_token
        })
      )
      return {
        access_token,
        refresh_token,
        new_user: 0
      }
    } else {
      // Nếu chưa đăng ký, tạo mới người dùng
      const user_id = new ObjectId()
      const password = Math.random().toString(36).substring(2, 15) // Tạo mật khẩu ngẫu nhiên
      await databaseService.users.insertOne(
        new User({
          _id: user_id,
          email: userInfo.email,
          password: md5(password),
          avatar: userInfo.picture
        })
      )
      const [access_token, refresh_token] =
        await this.signAccessAndRefreshToken(user_id.toString())
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user_id),
          token: refresh_token
        })
      )
      return {
        access_token,
        refresh_token,
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
      ].join(' ')
    }

    const queryString = new URLSearchParams(
      query as Record<string, string>
    ).toString()
    return `${url}?${queryString}`
  }

  async sendOTPVerifyEmail(email: string, type: VerifyEmailType) {
    const otp = generateOTP(4)

    sendMail(
      email,
      'Yêu cầu mã xác thực từ FluentAI',
      ` Mã OTP của bạn là:

          <h1 style="font-size: 36px; letter-spacing: 3px; margin: 10px 0; color: #000;">${otp}</h1>

          (Mã có hiệu lực trong 15 phút)

          Không chia sẻ mã này với bất kỳ ai.

          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`
    )

    await databaseService.otpVerifyEmail.insertOne(
      new OTPVerifyEmail({
        email,
        type,
        otp,
        expires_at: new Date(Date.now() + 1000 * 60 * 15)
      })
    )
  }

  async resetPassword(email: string, password: string) {
    const passwordHash = md5(password)
    await databaseService.users.updateOne(
      { email },
      { $set: { password: passwordHash } }
    )
  }

  async getUserById(user_id: string) {
    return await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  }

  async checkUsernameExists(username: string, user_id?: string) {
    const query: Record<string, unknown> = { username }
    if (user_id) {
      query._id = { $ne: new ObjectId(user_id) }
    }
    return await databaseService.users.findOne(query)
  }

  async updateProfile(
    user_id: string,
    username: string,
    date_of_birth: Date,
    phone_number: string,
    gender: GenderType
  ) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          username,
          date_of_birth,
          phone_number,
          gender,
          update_at: new Date()
        }
      }
    )
  }

  async changePassword(user_id: string, newPassword: string) {
    const passwordHash = md5(newPassword)
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: passwordHash, update_at: new Date() } }
    )
  }

  async getListUsers({
    page = 1,
    limit = 10,
    status = '' as any,
    search = '',
    sort = 'desc',
    startDate,
    endDate
  }: {
    page?: number
    limit?: number
    status?: UserStatus | ''
    search?: string
    sort?: 'asc' | 'desc'
    startDate?: string
    endDate?: string
  }) {
    const skip = (page - 1) * limit
    const matchStage: any = {}

    if (status) {
      matchStage.status = status
    }

    if (search) {
      const searchConditions: any[] = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ]

      if (ObjectId.isValid(search)) {
        searchConditions.push({ _id: new ObjectId(search) })
      }

      matchStage.$or = searchConditions
    }

    if (startDate || endDate) {
      matchStage.create_at = {}
      if (startDate) {
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        matchStage.create_at.$gte = start
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        matchStage.create_at.$lte = end
      }
    }

    const sortOrder = sort === 'asc' ? 1 : -1

    const [list, total] = await Promise.all([
      databaseService.users
        .aggregate([
          { $match: matchStage },
          { $sort: { create_at: sortOrder } },
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray(),
      databaseService.users.countDocuments(matchStage)
    ])

    const totalPages = Math.ceil(total / limit)
    return {
      list,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  }

  async lockUser(userId: string) {
    return await Promise.all([
      databaseService.users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { status: UserStatus.BLOCKED } }
      ),
      databaseService.refreshTokens.deleteMany({
        user_id: new ObjectId(userId)
      })
    ])
  }

  async unlockUser(userId: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status: UserStatus.ACTIVE } }
    )
  }

  async updateUserManage(
    userId: string,
    username: string,
    email: string,
    dateOfBirth: Date,
    phoneNumber: string,
    gender: GenderType
  ) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          username,
          email,
          date_of_birth: dateOfBirth,
          phone_number: phoneNumber,
          gender,
          update_at: new Date()
        }
      }
    )
  }
}

const userService = new UserService()
export default userService
