import { ObjectId } from 'mongodb'
import { UserScoreType } from '~/constants/enum'
import { databaseService } from './database.service'
import SystemScore from '~/models/schemas/system-score.schema'
import UserScore from '~/models/schemas/user-score.schema'

class ScoreService {
  private scoreConfigCache: SystemScore | null = null
  private isCacheLoaded: boolean = false

  async getActiveScoreConfig(
    forceRefresh: boolean = false
  ): Promise<SystemScore | null> {
    if (!forceRefresh && this.isCacheLoaded && this.scoreConfigCache) {
      return this.scoreConfigCache
    }

    const config = await databaseService.systemScores.findOne({
      isActive: true
    })

    this.scoreConfigCache = config
    this.isCacheLoaded = true

    return config
  }

  async loadCache(): Promise<SystemScore | null> {
    return await this.getActiveScoreConfig(true)
  }

  async refreshCache(): Promise<SystemScore | null> {
    this.invalidateCache()
    return await this.loadCache()
  }

  invalidateCache(): void {
    this.scoreConfigCache = null
    this.isCacheLoaded = false
  }

  getCachedConfig(): SystemScore | null {
    return this.scoreConfigCache
  }

  async getScoreForPracticeType(userScoreType: UserScoreType): Promise<number> {
    const config = await this.getActiveScoreConfig()

    if (!config) {
      return this.getDefaultScore(userScoreType)
    }

    const scoreConfig = config.scoreConfigs.find(
      (sc) => sc.userScoreType === userScoreType
    )

    return scoreConfig?.baseScore || 0
  }

  private getDefaultScore(userScoreType: UserScoreType): number {
    const defaults: Record<UserScoreType, number> = {
      [UserScoreType.WRITING_SENTENCE]: 10,
      [UserScoreType.WRITING_PARAGRAPH]: 20,
      [UserScoreType.SPEAKING_SENTENCE]: 15,
      [UserScoreType.SPEAKING_SHADOWING]: 15,
      [UserScoreType.LISTENING_VIDEO]: 10
    }
    return defaults[userScoreType] || 0
  }

  async addScore(
    userId: ObjectId,
    userScoreType: UserScoreType,
    practiceId: ObjectId,
    title: string
  ) {
    const scoreToAdd = await this.getScoreForPracticeType(userScoreType)
    if (scoreToAdd === 0) return

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()

    const userScore = await databaseService.userScores.findOne({
      userId,
      year,
      month,
      day
    })

    const scoreInfo = {
      type: userScoreType,
      idPractice: practiceId,
      title,
      score: scoreToAdd,
      create_at: now
    }

    if (!userScore) {
      const newUserScore = new UserScore({
        userId,
        year,
        month,
        day,
        scores: [scoreInfo]
      })
      await databaseService.userScores.insertOne(newUserScore)
      return newUserScore
    }

    await databaseService.userScores.updateOne(
      { _id: userScore._id },
      {
        $push: { scores: scoreInfo },
        $set: { update_at: now }
      }
    )
  }

  async getUserDailyScore(
    userId: ObjectId,
    year?: number,
    month?: number,
    day?: number
  ) {
    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month || now.getMonth() + 1
    const targetDay = day || now.getDate()

    const userScore = await databaseService.userScores.findOne({
      userId,
      year: targetYear,
      month: targetMonth,
      day: targetDay
    })

    return (
      userScore || {
        userId,
        year: targetYear,
        month: targetMonth,
        day: targetDay,
        scores: []
      }
    )
  }

  async getUserMonthlyScore(userId: ObjectId, year?: number, month?: number) {
    const now = new Date()
    const targetYear = year || now.getFullYear()
    const targetMonth = month || now.getMonth() + 1

    const userScores = await databaseService.userScores
      .find({
        userId,
        year: targetYear,
        month: targetMonth
      })
      .toArray()

    const totalScore = userScores.reduce((total, us) => {
      const dayTotal = us.scores.reduce((sum, s) => sum + s.score, 0)
      return total + dayTotal
    }, 0)

    return {
      userId,
      year: targetYear,
      month: targetMonth,
      totalScore,
      days: userScores.length,
      details: userScores
    }
  }
}

const scoreService = new ScoreService()
export default scoreService
