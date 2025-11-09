import { ObjectId } from "mongodb"
import { databaseService } from "./database.service"
import { config } from "dotenv"
config()

class WritingService {
    async getWSList(find: {level?: ObjectId, topic?: ObjectId, page?: number, limit?: number}) {   
        const { page = 1, limit = 10, ...matchQuery } = find
        const skip = (page - 1) * limit

        const matchStage: any = {}
        if (matchQuery.level) matchStage.level = matchQuery.level
        if (matchQuery.topic) matchStage.topic = matchQuery.topic

        const [data, total] = await Promise.all([
          databaseService.wsLists.aggregate(
            [
              { $match: matchStage },
              { $sort: { pos: 1 } },
              {
                '$lookup': {
                  'from': 'levels', 
                  'localField': 'level', 
                  'foreignField': '_id', 
                  'as': 'level'
                }
              },
              { $unwind: '$level' },
              {
                '$lookup': {
                  'from': 'topics', 
                  'localField': 'topic', 
                  'foreignField': '_id', 
                  'as': 'topic'
                }
              },
              { $unwind: '$topic' },
              { $skip: skip },
              { $limit: limit }
            ]
          ).toArray(),
          databaseService.wsLists.countDocuments(matchStage)
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

const writingService = new WritingService()
export default writingService