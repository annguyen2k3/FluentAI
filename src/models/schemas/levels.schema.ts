import { ObjectId } from "mongodb"
import { createSlug } from "~/utils/format"

interface LevelType {
    _id?: ObjectId
    title: string
    description: string
    fa_class_icon: string
    slug?: string
}

export default class Levels {
    _id?: ObjectId
    title: string
    description: string
    fa_class_icon: string
    slug?: string

    constructor(levels: LevelType) {
        this._id = levels._id || new ObjectId()
        this.title = levels.title || ''
        this.description = levels.description || ''
        this.fa_class_icon = levels.fa_class_icon || ''
        this.slug = levels.slug || createSlug(levels.title)
    }
}