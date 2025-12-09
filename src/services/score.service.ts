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

    const rankAggregation = await databaseService.userScores
      .aggregate([
        {
          $match: {
            year: targetYear,
            month: targetMonth
          }
        },
        { $unwind: '$scores' },
        {
          $group: {
            _id: '$userId',
            totalScore: { $sum: '$scores.score' }
          }
        },
        {
          $match: {
            totalScore: { $gt: totalScore }
          }
        },
        { $count: 'greaterCount' }
      ])
      .toArray()

    const greaterCount =
      rankAggregation && rankAggregation.length
        ? rankAggregation[0].greaterCount
        : 0
    const rank = greaterCount + 1

    return {
      userId,
      year: targetYear,
      month: targetMonth,
      totalScore,
      rank,
      days: userScores.length,
      details: userScores
    }
  }

  async getListRanking({
    page = 1,
    limit = 10,
    year,
    month
  }: {
    page?: number
    limit?: number
    year?: number
    month?: number
  }): Promise<{
    data: {
      rank: number
      userId: ObjectId
      username: string
      userAvatar: string
      totalScore: number
    }[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }> {
    type RankingItem = {
      rank: number
      userId: ObjectId
      username: string
      userAvatar: string
      totalScore: number
    }

    const safePage = Math.max(1, Number(page) || 1)
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10))
    const targetYear = Number.isFinite(Number(year))
      ? Number(year)
      : new Date().getFullYear()
    const targetMonth = Number.isFinite(Number(month))
      ? Number(month)
      : new Date().getMonth() + 1
    const skip = (safePage - 1) * safeLimit

    const basePipeline = [
      { $match: { year: targetYear, month: targetMonth } },
      { $unwind: '$scores' },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$scores.score' }
        }
      },
      { $sort: { totalScore: -1 } }
    ]

    const dataPipeline = [
      ...basePipeline,
      { $skip: skip },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: { $ifNull: ['$user.username', 'Người dùng'] },
          userAvatar: {
            $ifNull: [
              '$user.avatar',
              'https://fluent-ai-bucket.s3.ap-southeast-1.amazonaws.com/avatar_user_default.png'
            ]
          },
          totalScore: { $ifNull: ['$totalScore', 0] }
        }
      }
    ]

    const countPipeline = [...basePipeline, { $count: 'total' }]

    const [ranking, totalResult] = await Promise.all([
      databaseService.userScores.aggregate(dataPipeline).toArray(),
      databaseService.userScores.aggregate(countPipeline).toArray()
    ])

    const total = totalResult[0]?.total || 0
    const totalPages = Math.ceil(total / safeLimit) || 1

    const data = (ranking as RankingItem[]).map((item, index) => ({
      ...item,
      rank: skip + index + 1
    }))

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1
      }
    }
  }
}

const scoreService = new ScoreService()
export default scoreService
