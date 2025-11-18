import Levels from '~/models/schemas/levels.schema'
import Types from '~/models/schemas/types.schema'
import Topics from '~/models/schemas/topics.schema'
import { databaseService } from './database.service'
import { ObjectId } from 'mongodb'

class CategoriesServices {
  async getLevels() {
    const levels = await databaseService.levels.find().sort({ pos: 1 }).toArray()
    return levels
  }

  async createLevel(
    title: string,
    description: string,
    fa_class_icon: string,
    slug: string,
    pos: number
  ) {
    const level = new Levels({ title, description, fa_class_icon, slug, pos })
    const result = await databaseService.levels.insertOne(level)
    const createdLevel = await databaseService.levels.findOne({ _id: result.insertedId })
    return createdLevel
  }

  async updateLevel(
    id: string,
    title: string,
    description: string,
    fa_class_icon: string,
    slug: string,
    pos: number
  ) {
    const level = await databaseService.levels.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, fa_class_icon, slug, pos } }
    )
    const updatedLevel = await databaseService.levels.findOne({ _id: new ObjectId(id) })
    return updatedLevel
  }

  async deleteLevel(id: string) {
    try {
      await databaseService.levels.deleteOne({ _id: new ObjectId(id) })
      return true
    } catch (error) {
      return false
    }
  }

  async getTypes() {
    const types = await databaseService.types.find().sort({ pos: 1 }).toArray()
    return types
  }

  async createType(
    title: string,
    description: string,
    fa_class_icon: string,
    slug: string,
    pos: number
  ) {
    const type = new Types({ title, description, fa_class_icon, slug, pos })
    const result = await databaseService.types.insertOne(type)
    const createdType = await databaseService.types.findOne({ _id: result.insertedId })
    return createdType
  }

  async updateType(
    id: string,
    title: string,
    description: string,
    fa_class_icon: string,
    slug: string,
    pos: number
  ) {
    const type = await databaseService.types.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, fa_class_icon, slug, pos } }
    )
    const updatedType = await databaseService.types.findOne({ _id: new ObjectId(id) })
    return updatedType
  }

  async deleteType(id: string) {
    try {
      await databaseService.types.deleteOne({ _id: new ObjectId(id) })
      return true
    } catch (error) {
      return false
    }
  }

  async getTopics() {
    const topics = await databaseService.topics.find().sort({ pos: 1 }).toArray()
    return topics
  }

  async createTopic(
    title: string,
    description: string,
    fa_class_icon: string,
    slug: string,
    pos: number
  ) {
    const topic = new Topics({ title, description, fa_class_icon, slug, pos })
    const result = await databaseService.topics.insertOne(topic)
    const createdTopic = await databaseService.topics.findOne({ _id: result.insertedId })
    return createdTopic
  }

  async updateTopic(
    id: string,
    title: string,
    description: string,
    fa_class_icon: string,
    slug: string,
    pos: number
  ) {
    const topic = await databaseService.topics.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, fa_class_icon, slug, pos } }
    )
    const updatedTopic = await databaseService.topics.findOne({ _id: new ObjectId(id) })
    return updatedTopic
  }

  async deleteTopic(id: string) {
    try {
      await databaseService.topics.deleteOne({ _id: new ObjectId(id) })
      return true
    } catch (error) {
      return false
    }
  }
}

const categoriesServices = new CategoriesServices()
export default categoriesServices
