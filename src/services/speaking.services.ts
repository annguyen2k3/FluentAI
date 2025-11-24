import { ObjectId } from 'mongodb'
import { databaseService } from './database.service'

class SpeakingServices {
  async getSSList(find: {
    level?: ObjectId
    topic?: ObjectId
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const {
      page = 1,
      limit = 10,
      sortKey = 'pos',
      sortOrder = 'asc',
      ...matchQuery
    } = find
    const skip = (page - 1) * limit
    const matchStage: Record<string, unknown> = {}
    if (matchQuery.level) matchStage.level = matchQuery.level
    if (matchQuery.topic) matchStage.topic = matchQuery.topic
    if (matchQuery.search)
      matchStage.title = { $regex: matchQuery.search, $options: 'i' }

    const [data, total] = await Promise.all([
      databaseService.ssLists
        .aggregate([
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
              localField: 'topic',
              foreignField: '_id',
              as: 'topic'
            }
          },
          { $unwind: '$topic' },
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray(),
      databaseService.ssLists.countDocuments(matchStage)
    ])

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
}

const speakingServices = new SpeakingServices()
export default speakingServices
