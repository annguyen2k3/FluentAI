import md5 from 'md5'
import { databaseService } from './database.service'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

class AdminServices {
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
}

const adminServices = new AdminServices()
export default adminServices
