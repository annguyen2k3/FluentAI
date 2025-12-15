import { ObjectId } from 'mongodb'
import { PromptFeature, PromptFeatureType } from '~/constants/enum'

interface PromptType {
  _id?: ObjectId
  title: string
  description?: string
  feature: PromptFeature
  feature_type: PromptFeatureType
  content: string
  replace_variables: string[]
  isActive?: boolean
  create_at?: Date
  update_at?: Date
}

export default class Prompts {
  _id?: ObjectId
  title: string
  feature: PromptFeature
  feature_type: PromptFeatureType
  content: string
  description?: string
  replace_variables: string[]
  isActive?: boolean
  create_at?: Date
  update_at?: Date

  constructor(prompts: PromptType) {
    this._id = prompts._id || new ObjectId()
    this.title = prompts.title || ''
    this.feature = prompts.feature
    this.feature_type = prompts.feature_type
    this.content = prompts.content
    this.description = prompts.description || ''
    this.replace_variables = prompts.replace_variables || []
    this.isActive = prompts.isActive ?? false
    this.create_at = prompts.create_at || new Date()
    this.update_at = prompts.update_at || new Date()
  }
}
