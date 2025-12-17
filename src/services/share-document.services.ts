import { ObjectId } from 'mongodb'
import { databaseService } from './database.service'
import ShareDocument from '~/models/schemas/share-document.schema'

class ShareDocumentServices {
  async getList(find: {
    page?: number
    limit?: number
    search?: string
    sortKey?: string
    sortOrder?: 'asc' | 'desc'
    isActive?: boolean
  }) {
    const {
      page = 1,
      limit = 10,
      sortKey = 'create_at',
      sortOrder = 'desc',
      ...matchQuery
    } = find
    const skip = (page - 1) * limit
    const matchStage: Record<string, unknown> = {}

    if (matchQuery.isActive !== undefined) {
      matchStage.isActive = matchQuery.isActive
    }

    if (matchQuery.search) {
      matchStage.$or = [
        { title: { $regex: matchQuery.search, $options: 'i' } },
        { author: { $regex: matchQuery.search, $options: 'i' } },
        { content: { $regex: matchQuery.search, $options: 'i' } }
      ]
    }

    const basePipeline: Record<string, unknown>[] = [
      { $match: matchStage },
      {
        $sort: {
          [sortKey]: sortOrder === 'asc' ? 1 : -1
        }
      }
    ]

    const dataPipeline = [...basePipeline, { $skip: skip }, { $limit: limit }]
    const countPipeline = [...basePipeline, { $count: 'total' }]

    const [data, totalResult] = await Promise.all([
      databaseService.shareDocuments.aggregate(dataPipeline).toArray(),
      databaseService.shareDocuments.aggregate(countPipeline).toArray()
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

  async create(shareDocument: ShareDocument) {
    const newShareDocument = new ShareDocument(shareDocument)
    await databaseService.shareDocuments.insertOne(newShareDocument)
    return newShareDocument
  }

  async update(shareDocument: ShareDocument) {
    const updateData: any = {
      ...shareDocument,
      update_at: new Date()
    }
    await databaseService.shareDocuments.updateOne(
      { _id: shareDocument._id },
      { $set: updateData }
    )
    return shareDocument
  }

  async delete(id: string) {
    await databaseService.shareDocuments.deleteOne({ _id: new ObjectId(id) })
    return true
  }

  async duplicate(id: string) {
    const original = await databaseService.shareDocuments.findOne({
      _id: new ObjectId(id)
    })
    if (!original) {
      return null
    }

    const duplicated = new ShareDocument({
      title: `${original.title} (Copy)`,
      author: original.author,
      content: original.content,
      isActive: false
    })

    await databaseService.shareDocuments.insertOne(duplicated)
    return duplicated
  }

  async getById(id: string, active?: boolean) {
    const filter: Record<string, unknown> = {
      _id: new ObjectId(id)
    }
    if (active !== undefined) {
      filter.isActive = active
    }
    return await databaseService.shareDocuments.findOne(filter)
  }

  async getBySlug(slug: string, active?: boolean) {
    const filter: Record<string, unknown> = {
      slug: slug
    }
    if (active !== undefined) {
      filter.isActive = active
    }
    return await databaseService.shareDocuments.findOne(filter)
  }

  async bookmark(userId: string, shareDocumentId: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(userId)
    })
    if (!user) {
      return false
    }
    const shareDocument = await databaseService.shareDocuments.findOne({
      _id: new ObjectId(shareDocumentId)
    })
    if (!shareDocument) {
      return false
    }
    const bookmarks = [...(user.bookmarks || [])]
    const existingIndex = bookmarks.findIndex(
      (item) => item.toString() === shareDocumentId
    )
    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1)
    } else {
      bookmarks.push(new ObjectId(shareDocumentId))
    }
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { bookmarks: bookmarks } }
    )
    return true
  }

  async unbookmark(userId: string, shareDocumentId: string) {
    const user = await databaseService.users.findOne({
      _id: new ObjectId(userId)
    })
    if (!user) {
      return false
    }
    const bookmarks = [...(user.bookmarks || [])]

    const existingIndex = bookmarks.findIndex(
      (item) => item.toString() === shareDocumentId
    )
    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1)
    }
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { bookmarks: bookmarks } }
    )
    return true
  }
}

const shareDocumentServices = new ShareDocumentServices()
export default shareDocumentServices
