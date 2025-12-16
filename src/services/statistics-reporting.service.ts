import { Document, Filter } from 'mongodb'
import { TransactionStatus, UserScoreType, UserStatus } from '~/constants/enum'
import { databaseService } from './database.service'
import { ApiRequestMetric, getApiRequestsMetrics } from '~/utils/gg-monitoring'

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

export interface RevenueParams {
  startDate?: string
  endDate?: string
}

export interface RevenueDailyStat {
  date: string
  totalIncome: number
  totalCredit: number
  successTransactions: number
}

export interface RevenueResult {
  summary: {
    systemBalance: number
    totalIncome: number
    totalCredit: number
  }
  stats: RevenueDailyStat[]
}

export interface GoogleApiRequestParams {
  startDate?: string
  endDate?: string
}

export interface GoogleApiServiceSummary {
  serviceName: string
  success200: number
  failed404: number
  total: number
}

export interface GoogleApiDailyServiceStat {
  serviceName: string
  success200: number
  failed404: number
  total: number
  latencyMedianMs?: number
  latencyP95Ms?: number
}

export interface GoogleApiDailyStat {
  date: string
  services: GoogleApiDailyServiceStat[]
}

export interface GoogleApiRequestResult {
  summary: GoogleApiServiceSummary[]
  stats: GoogleApiDailyStat[]
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

function formatDateLabel(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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
            format: '%d/%m/%Y',
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

export async function getRevenueStatisticsService(
  params: RevenueParams
): Promise<RevenueResult> {
  const walletsCol = databaseService.wallets

  const start = parseDateBoundary(params.startDate)
  const end = parseDateBoundary(params.endDate, true)

  const matchConditions: Filter<unknown> = {
    'history_transactions.status': TransactionStatus.SUCCESS
  }

  if (start || end) {
    matchConditions['history_transactions.create_at'] = {}
    if (start) {
      matchConditions['history_transactions.create_at'].$gte = start
    }
    if (end) {
      matchConditions['history_transactions.create_at'].$lte = end
    }
  }

  const dailyPipeline: Document[] = [
    { $unwind: '$history_transactions' },
    { $match: matchConditions },
    {
      $project: {
        price: '$history_transactions.price',
        credit: '$history_transactions.credit',
        status: '$history_transactions.status',
        create_at: '$history_transactions.create_at',
        date: {
          $dateToString: {
            format: '%d/%m/%Y',
            date: '$history_transactions.create_at',
            timezone: 'UTC'
          }
        }
      }
    },
    {
      $group: {
        _id: '$date',
        totalIncome: { $sum: '$price' },
        totalCredit: { $sum: '$credit' },
        successTransactions: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]

  const summaryPipeline: Document[] = [
    {
      $group: {
        _id: null,
        systemBalance: { $sum: '$balance_credit' }
      }
    }
  ]

  const [summaryBalanceData, statsData] = await Promise.all([
    walletsCol.aggregate(summaryPipeline).toArray(),
    walletsCol.aggregate(dailyPipeline).toArray()
  ])

  const summaryBalanceDoc = summaryBalanceData?.[0] || {
    systemBalance: 0
  }

  const stats: RevenueDailyStat[] = statsData.map((item) => ({
    date: item._id as string,
    totalIncome: item.totalIncome || 0,
    totalCredit: item.totalCredit || 0,
    successTransactions: item.successTransactions || 0
  }))

  const totalIncome = stats.reduce((sum, item) => sum + item.totalIncome, 0)
  const totalCredit = stats.reduce((sum, item) => sum + item.totalCredit, 0)

  return {
    summary: {
      systemBalance: summaryBalanceDoc.systemBalance || 0,
      totalIncome,
      totalCredit
    },
    stats
  }
}

const GOOGLE_API_SERVICES = [
  'generativelanguage.googleapis.com',
  'speech.googleapis.com',
  'texttospeech.googleapis.com'
] as const

type GoogleApiServiceName = (typeof GOOGLE_API_SERVICES)[number]

function aggregateGoogleApiMetricsByDay(
  metrics: ApiRequestMetric[],
  start?: Date | null,
  end?: Date | null
): {
  summary: GoogleApiServiceSummary
  dailyMap: Map<string, GoogleApiDailyServiceStat>
} {
  const summary: GoogleApiServiceSummary = {
    serviceName: '',
    success200: 0,
    failed404: 0,
    total: 0
  }

  const dailyMap = new Map<string, GoogleApiDailyServiceStat>()

  metrics.forEach((metric) => {
    if (!(metric.date instanceof Date)) return

    if (start && metric.date.getTime() < start.getTime()) return
    if (end && metric.date.getTime() > end.getTime()) return

    const label = formatDateLabel(metric.date)
    const existing = dailyMap.get(label) || {
      serviceName: '',
      success200: 0,
      failed404: 0,
      total: 0,
      latencyMedianMs: undefined,
      latencyP95Ms: undefined
    }

    const isSuccess = metric.responseCode === '200'
    const isFailed = metric.responseCode === '404'

    if (isSuccess) {
      existing.success200 += metric.total
      summary.success200 += metric.total
    }

    if (isFailed) {
      existing.failed404 += metric.total
      summary.failed404 += metric.total
    }

    existing.total += metric.total
    summary.total += metric.total

    if (typeof metric.latencyMedianMs === 'number') {
      if (typeof existing.latencyMedianMs === 'number') {
        existing.latencyMedianMs =
          (existing.latencyMedianMs + metric.latencyMedianMs) / 2
      } else {
        existing.latencyMedianMs = metric.latencyMedianMs
      }
    }

    if (typeof metric.latencyP95Ms === 'number') {
      if (typeof existing.latencyP95Ms === 'number') {
        existing.latencyP95Ms =
          (existing.latencyP95Ms + metric.latencyP95Ms) / 2
      } else {
        existing.latencyP95Ms = metric.latencyP95Ms
      }
    }

    dailyMap.set(label, existing)
  })

  return { summary, dailyMap }
}

export async function getGoogleApiRequestStatisticsService(
  params: GoogleApiRequestParams
): Promise<GoogleApiRequestResult> {
  const now = new Date()

  let start = parseDateBoundary(params.startDate)
  let end = parseDateBoundary(params.endDate, true)

  if (!start && !end) {
    end = new Date(now)
    start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)
  }

  if (!end) end = now

  const startForDiff = new Date(
    (start || new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000)).getTime()
  )
  startForDiff.setHours(0, 0, 0, 0)

  const endForDiff = new Date(end.getTime())
  endForDiff.setHours(23, 59, 59, 999)

  const diffDays = Math.max(
    1,
    Math.ceil(
      (endForDiff.getTime() - startForDiff.getTime()) / (24 * 60 * 60 * 1000)
    )
  )

  const serviceMetrics = await Promise.all(
    GOOGLE_API_SERVICES.map((serviceName) =>
      getApiRequestsMetrics(serviceName, diffDays).then((metrics) => ({
        serviceName,
        metrics
      }))
    )
  )

  const summaryList: GoogleApiServiceSummary[] = []
  const dateMap = new Map<string, GoogleApiDailyStat>()

  serviceMetrics.forEach(({ serviceName, metrics }) => {
    const { summary, dailyMap } = aggregateGoogleApiMetricsByDay(
      metrics,
      startForDiff,
      endForDiff
    )

    summary.serviceName = serviceName
    summaryList.push(summary)

    dailyMap.forEach((dailyStat, dateLabel) => {
      const existing = dateMap.get(dateLabel)
      if (existing) {
        existing.services.push({
          ...dailyStat,
          serviceName
        })
      } else {
        dateMap.set(dateLabel, {
          date: dateLabel,
          services: [
            {
              ...dailyStat,
              serviceName
            }
          ]
        })
      }
    })
  })

  const stats: GoogleApiDailyStat[] = Array.from(dateMap.values()).sort(
    (a, b) => {
      const [da, ma, ya] = a.date.split('/').map(Number)
      const [db, mb, yb] = b.date.split('/').map(Number)
      const timeA = new Date(ya, (ma || 1) - 1, da || 1).getTime()
      const timeB = new Date(yb, (mb || 1) - 1, db || 1).getTime()
      return timeA - timeB
    }
  )

  return {
    summary: summaryList,
    stats
  }
}
