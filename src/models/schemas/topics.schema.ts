import { ObjectId } from "mongodb"
import { createSlug } from "~/utils/format"

interface TopicType {
    _id?: ObjectId
    title: string
    description: string
    fa_class_icon: string
    slug?: string
}

export default class Topics {
    _id?: ObjectId
    title: string
    description: string
    fa_class_icon: string
    slug?: string

    constructor(topics: TopicType) {
        this._id = topics._id || new ObjectId()
        this.title = topics.title || ''
        this.description = topics.description || ''
        this.fa_class_icon = topics.fa_class_icon || ''
        this.slug = topics.slug || createSlug(topics.title)
    }
}