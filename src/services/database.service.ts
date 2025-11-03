import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/users.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import OTPVerifyEmail from '~/models/schemas/otp-verify-email.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cp2tnzs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME as string)
  }

  async connect() {
    try {
      await this.client.connect()
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')

      await this.otpVerifyEmail.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
      await this.refreshTokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }

  get otpVerifyEmail(): Collection<OTPVerifyEmail> {
    return this.db.collection('otp_verify_email')
  }
}

export const databaseService = new DatabaseService()
