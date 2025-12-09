import { Collection, Db, MongoClient } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/users.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import OTPVerifyEmail from '~/models/schemas/otp-verify-email.schema'
import Levels from '~/models/schemas/levels.schema'
import Topics from '~/models/schemas/topics.schema'
import Types from '~/models/schemas/types.schema'
import WSList from '~/models/schemas/ws-list.schema'
import Prompts from '~/models/schemas/prompts.schema'
import WPParagraph from '~/models/schemas/wp-paragraph.schema'
import Admin from '~/models/schemas/admin.schema'
import SSList from '~/models/schemas/ss-list.schema'
import HisSSUser from '~/models/schemas/his-ss-user.schema'
import SVShadowing from '~/models/schemas/sv-shadowing.schema'
import HisPracticeUser from '~/models/schemas/his-practice-user.schema'
import ListeningVideo from '~/models/schemas/lv-video.schemas'
import SystemScore from '~/models/schemas/system-score.schema'
import UserScore from '~/models/schemas/user-score.schema'
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
      console.log(
        'Pinged your deployment. You successfully connected to MongoDB!'
      )

      await this.otpVerifyEmail.createIndex(
        { expires_at: 1 },
        { expireAfterSeconds: 0 }
      )
      await this.refreshTokens.createIndex(
        { expires_at: 1 },
        { expireAfterSeconds: 0 }
      )
      await this.wsListPreviews.createIndex(
        { update_at: 1 },
        { expireAfterSeconds: 60 * 60 * 3 }
      )
      await this.wpPreviews.createIndex(
        { update_at: 1 },
        { expireAfterSeconds: 60 * 60 * 3 }
      )
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

  get levels(): Collection<Levels> {
    return this.db.collection('levels')
  }

  get topics(): Collection<Topics> {
    return this.db.collection('topics')
  }

  get types(): Collection<Types> {
    return this.db.collection('types')
  }

  get wsLists(): Collection<WSList> {
    return this.db.collection('ws_lists')
  }

  get wsListPreviews(): Collection<WSList> {
    return this.db.collection('ws_list_previews')
  }

  get wpPreviews(): Collection<WPParagraph> {
    return this.db.collection('wp_previews')
  }

  get wpParagraphs(): Collection<WPParagraph> {
    return this.db.collection('wp_paragraphs')
  }

  get prompts(): Collection<Prompts> {
    return this.db.collection('prompts')
  }

  get admins(): Collection<Admin> {
    return this.db.collection('admin')
  }

  get ssLists(): Collection<SSList> {
    return this.db.collection('ss_lists')
  }

  get hisSSUsers(): Collection<HisSSUser> {
    return this.db.collection('his_ss_users')
  }

  get svShadowings(): Collection<SVShadowing> {
    return this.db.collection('sv_shadowings')
  }

  get hisPracticeUsers(): Collection<HisPracticeUser> {
    return this.db.collection('his_practice_users')
  }

  get listeningVideos(): Collection<ListeningVideo> {
    return this.db.collection('lv_videos')
  }

  get systemScores(): Collection<SystemScore> {
    return this.db.collection('system_scores')
  }

  get userScores(): Collection<UserScore> {
    return this.db.collection('user_scores')
  }
}

export const databaseService = new DatabaseService()
