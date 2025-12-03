import { ObjectId } from 'mongodb'
import { StatusLesson, HistoryUserType } from '~/constants/enum'
import { databaseService } from './database.service'
import HisLVUser from '~/models/schemas/his-lv.schema'
import HisUser from '~/models/schemas/his-user.schema'

class ListeningService {
  async getLVList(find: {
    level?: ObjectId
    topic?: ObjectId
    isActive?: boolean
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    history?: {
      userId: ObjectId
      status?: StatusLesson
    }
  }) {
    const {
      page = 1,
      limit = 10,
      sortKey = 'pos',
      sortOrder = 'asc',
      history,
      isActive,
      ...matchQuery
    } = find

    const skip = (page - 1) * limit
    const matchStage: Record<string, unknown> = {}

    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topics = matchQuery.topic
    if (matchQuery.search)
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }
    if (typeof isActive === 'boolean') matchStage.isActive = isActive

    const basePipeline: Record<string, unknown>[] = [
      { $match: matchStage },
      {
        $sort: {
          [sortKey]: sortOrder === 'asc' ? 1 : -1
        }
      },
      {
        $lookup: {
          from: 'levels',
          localField: 'level',
          foreignField: '_id',
          as: 'level'
        }
      },
      { $unwind: '$level' },
      {
        $lookup: {
          from: 'topics',
          localField: 'topics',
          foreignField: '_id',
          as: 'topic'
        }
      }
    ]

    if (history?.userId) {
      basePipeline.push({
        $lookup: {
          from: 'his_users',
          let: { lvId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', history.userId] },
                    {
                      $eq: ['$type', HistoryUserType.PRACTICE_LISTENING_VIDEO]
                    },
                    { $eq: ['$content.lvVideoId', '$$lvId'] }
                  ]
                }
              }
            },
            { $limit: 1 }
          ],
          as: 'history'
        }
      })

      basePipeline.push({
        $addFields: {
          history: { $arrayElemAt: ['$history', 0] }
        }
      })

      basePipeline.push({
        $addFields: {
          history: {
            $cond: [{ $ifNull: ['$history', false] }, '$history', {}]
          }
        }
      })

      if (history.status) {
        if (history.status === StatusLesson.NOT_STARTED) {
          basePipeline.push({
            $match: {
              $or: [
                { history: {} },
                { 'history.content.status': { $exists: false } }
              ]
            }
          })
        } else {
          basePipeline.push({
            $match: {
              'history.content.status': history.status
            }
          })
        }
      }
    }

    const dataPipeline = [...basePipeline, { $skip: skip }, { $limit: limit }]
    const countPipeline = [...basePipeline, { $count: 'total' }]

    const [data, totalResult] = await Promise.all([
      databaseService.listeningVideos.aggregate(dataPipeline).toArray(),
      databaseService.listeningVideos.aggregate(countPipeline).toArray()
    ])

    const total = totalResult[0]?.total || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data,
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

  async getLVDetail(slug: string) {
    const pipeline = [
      { $match: { slug } },
      {
        $lookup: {
          from: 'levels',
          localField: 'level',
          foreignField: '_id',
          as: 'level'
        }
      },
      { $unwind: { path: '$level', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'topics',
          localField: 'topics',
          foreignField: '_id',
          as: 'topicsDetail'
        }
      }
    ]

    const result = await databaseService.listeningVideos
      .aggregate(pipeline)
      .toArray()
    const lv = result[0]

    if (!lv) {
      throw new Error('Video nghe không tồn tại')
    }

    if (lv.level) {
      lv.levelTitle = lv.level.title || ''
    }

    return lv
  }

  async updateHistory(userId: ObjectId, lvId: ObjectId, status: StatusLesson) {
    const history = await databaseService.hisUsers.findOne({
      userId,
      type: HistoryUserType.PRACTICE_LISTENING_VIDEO,
      content: { lvVideoId: lvId }
    })

    if (!history) {
      const newHisLV = new HisLVUser({
        lvVideoId: lvId,
        status
      })
      const newHisUser = new HisUser({
        userId,
        type: HistoryUserType.PRACTICE_LISTENING_VIDEO,
        content: newHisLV
      })
      await databaseService.hisUsers.insertOne(newHisUser)
      return
    }

    await databaseService.hisUsers.updateOne(
      { _id: history._id },
      { $set: { 'content.status': status, update_at: new Date() } }
    )
  }
}

const listeningService = new ListeningService()
export default listeningService
