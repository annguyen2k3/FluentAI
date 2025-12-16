import { Document, Filter } from 'mongodb'
import { UserScoreType, UserStatus } from '~/constants/enum'
import { databaseService } from './database.service'

export interface UsersOverviewParams {
  type?: 'all' | 'active' | 'blocked' | 'new'
  startDate?: string
  endDate?: string
}

export interface UsersOverviewStat {
  date: string
  total: number
  active: number
  blocked: number
  newUsers: number
}

export interface UsersOverviewResult {
  summary: {
    totalUsers: number
    activeUsers: number
    blockedUsers: number
    newUsers: number
  }
  stats: UsersOverviewStat[]
}

export interface UsersScoreParams {
  startDate?: string
  endDate?: string
}

export interface UsersScoreDailyStat {
  date: string
  totalScore: number
  writingSentence: number
  writingParagraph: number
  speakingSentence: number
  speakingShadowing: number
  listeningVideo: number
}

export interface UsersScoreResult {
  summary: {
    totalScore: number
    writingSentence: number
    writingParagraph: number
    speakingSentence: number
    speakingShadowing: number
    listeningVideo: number
  }
  stats: UsersScoreDailyStat[]
}

function parseDateBoundary(dateStr?: string, isEnd = false): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return null
  if (isEnd) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }
  return date
}

export async function getUsersOverviewService(
  params: UsersOverviewParams
): Promise<UsersOverviewResult> {
  const usersCol = databaseService.users

  const filter: Filter<unknown> = {}
  const start = parseDateBoundary(params.startDate)
  const end = parseDateBoundary(params.endDate, true)

  if (start || end) {
    filter.create_at = {}
    if (start) {
      filter.create_at.$gte = start
    }
    if (end) {
      filter.create_at.$lte = end
    }
  }

  if (params.type && params.type !== 'all') {
    if (params.type === 'active') filter.status = UserStatus.ACTIVE
    if (params.type === 'blocked') filter.status = UserStatus.BLOCKED
    // type new => filter by date range only; no status filter needed
  }

  const pipeline: Document[] = [
    { $match: filter },
    {
      $project: {
        status: 1,
        create_at: 1,
        date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$create_at',
            timezone: 'UTC'
          }
        }
      }
    },
    {
      $group: {
        _id: '$date',
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$status', UserStatus.ACTIVE] }, 1, 0]
          }
        },
        blocked: {
          $sum: {
            $cond: [{ $eq: ['$status', UserStatus.BLOCKED] }, 1, 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]

  const [summaryData, statsData] = await Promise.all([
    usersCol
      .aggregate([
        {
          $facet: {
            total: [{ $count: 'value' }],
            active: [
              { $match: { status: UserStatus.ACTIVE } },
              { $count: 'value' }
            ],
            blocked: [
              { $match: { status: UserStatus.BLOCKED } },
              { $count: 'value' }
            ],
            newUsers: [
              {
                $match: {
                  create_at: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              },
              { $count: 'value' }
            ]
          }
        },
        {
          $project: {
            total: { $ifNull: [{ $arrayElemAt: ['$total.value', 0] }, 0] },
            active: { $ifNull: [{ $arrayElemAt: ['$active.value', 0] }, 0] },
            blocked: { $ifNull: [{ $arrayElemAt: ['$blocked.value', 0] }, 0] },
            newUsers: {
              $ifNull: [{ $arrayElemAt: ['$newUsers.value', 0] }, 0]
            }
          }
        }
      ])
      .toArray(),
    usersCol.aggregate(pipeline).toArray()
  ])

  const summaryResult = summaryData?.[0] || {
    total: 0,
    active: 0,
    blocked: 0,
    newUsers: 0
  }

  const stats: UsersOverviewStat[] = statsData.map((item) => ({
    date: item._id as string,
    total: item.total || 0,
    active: item.active || 0,
    blocked: item.blocked || 0,
    newUsers: item.total || 0
  }))

  return {
    summary: {
      totalUsers: summaryResult.total || 0,
      activeUsers: summaryResult.active || 0,
      blockedUsers: summaryResult.blocked || 0,
      newUsers: summaryResult.newUsers || 0
    },
    stats
  }
}

export async function getUsersScoreStatisticsService(
  params: UsersScoreParams
): Promise<UsersScoreResult> {
  const userScoresCol = databaseService.userScores

  const filter: Filter<unknown> = {}
  const start = parseDateBoundary(params.startDate)
  const end = parseDateBoundary(params.endDate, true)

  if (start || end) {
    filter.create_at = {}
    if (start) {
      filter.create_at.$gte = start
    }
    if (end) {
      filter.create_at.$lte = end
    }
  }

  const dailyPipeline: Document[] = [
    { $match: filter },
    { $unwind: '$scores' },
    {
      $project: {
        date: {
          $dateToString: {
            format: '%d/%m/%Y',
            date: '$create_at',
            timezone: 'UTC'
          }
        },
        type: '$scores.type',
        score: '$scores.score'
      }
    },
    {
      $group: {
        _id: '$date',
        totalScore: { $sum: '$score' },
        writingSentence: {
          $sum: {
            $cond: [
              { $eq: ['$type', UserScoreType.WRITING_SENTENCE] },
              '$score',
              0
            ]
          }
        },
        writingParagraph: {
          $sum: {
            $cond: [
              { $eq: ['$type', UserScoreType.WRITING_PARAGRAPH] },
              '$score',
              0
            ]
          }
        },
        speakingSentence: {
          $sum: {
            $cond: [
              { $eq: ['$type', UserScoreType.SPEAKING_SENTENCE] },
              '$score',
              0
            ]
          }
        },
        speakingShadowing: {
          $sum: {
            $cond: [
              { $eq: ['$type', UserScoreType.SPEAKING_SHADOWING] },
              '$score',
              0
            ]
          }
        },
        listeningVideo: {
          $sum: {
            $cond: [
              { $eq: ['$type', UserScoreType.LISTENING_VIDEO] },
              '$score',
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]

  const summaryPipeline: Document[] = [
    { $match: filter },
    { $unwind: '$scores' },
    {
      $group: {
        _id: null,
        totalScore: { $sum: '$scores.score' },
        writingSentence: {
          $sum: {
            $cond: [
              { $eq: ['$scores.type', UserScoreType.WRITING_SENTENCE] },
              '$scores.score',
              0
            ]
          }
        },
        writingParagraph: {
          $sum: {
            $cond: [
              { $eq: ['$scores.type', UserScoreType.WRITING_PARAGRAPH] },
              '$scores.score',
              0
            ]
          }
        },
        speakingSentence: {
          $sum: {
            $cond: [
              { $eq: ['$scores.type', UserScoreType.SPEAKING_SENTENCE] },
              '$scores.score',
              0
            ]
          }
        },
        speakingShadowing: {
          $sum: {
            $cond: [
              { $eq: ['$scores.type', UserScoreType.SPEAKING_SHADOWING] },
              '$scores.score',
              0
            ]
          }
        },
        listeningVideo: {
          $sum: {
            $cond: [
              { $eq: ['$scores.type', UserScoreType.LISTENING_VIDEO] },
              '$scores.score',
              0
            ]
          }
        }
      }
    }
  ]

  const [summaryData, statsData] = await Promise.all([
    userScoresCol.aggregate(summaryPipeline).toArray(),
    userScoresCol.aggregate(dailyPipeline).toArray()
  ])

  const summaryDoc = summaryData?.[0] || {
    totalScore: 0,
    writingSentence: 0,
    writingParagraph: 0,
    speakingSentence: 0,
    speakingShadowing: 0,
    listeningVideo: 0
  }

  let stats: UsersScoreDailyStat[] = statsData.map((item) => ({
    date: item._id as string,
    totalScore: item.totalScore || 0,
    writingSentence: item.writingSentence || 0,
    writingParagraph: item.writingParagraph || 0,
    speakingSentence: item.speakingSentence || 0,
    speakingShadowing: item.speakingShadowing || 0,
    listeningVideo: item.listeningVideo || 0
  }))

  // Bổ sung các ngày không có dữ liệu với giá trị 0 để hiển thị liền mạch trên UI
  if (start && end) {
    const pad = (value: number) => String(value).padStart(2, '0')
    const statsMap = new Map<string, UsersScoreDailyStat>()
    stats.forEach((item) => {
      statsMap.set(item.date, item)
    })

    const filledStats: UsersScoreDailyStat[] = []
    const cursor = new Date(start)

    // Duyệt từng ngày trong khoảng filter và lấy dữ liệu hoặc mặc định 0
    while (cursor.getTime() <= end.getTime()) {
      const label = `${pad(cursor.getDate())}/${pad(
        cursor.getMonth() + 1
      )}/${cursor.getFullYear()}`

      const existing = statsMap.get(label)
      if (existing) {
        filledStats.push(existing)
      } else {
        filledStats.push({
          date: label,
          totalScore: 0,
          writingSentence: 0,
          writingParagraph: 0,
          speakingSentence: 0,
          speakingShadowing: 0,
          listeningVideo: 0
        })
      }

      cursor.setDate(cursor.getDate() + 1)
    }

    stats = filledStats
  }

  return {
    summary: {
      totalScore: summaryDoc.totalScore || 0,
      writingSentence: summaryDoc.writingSentence || 0,
      writingParagraph: summaryDoc.writingParagraph || 0,
      speakingSentence: summaryDoc.speakingSentence || 0,
      speakingShadowing: summaryDoc.speakingShadowing || 0,
      listeningVideo: summaryDoc.listeningVideo || 0
    },
    stats
  }
}
