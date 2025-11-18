import Levels from '~/models/schemas/levels.schema'
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
}

const categoriesServices = new CategoriesServices()
export default categoriesServices
