import { Document, Filter } from 'mongodb'
import { UserStatus } from '~/constants/enum'
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
