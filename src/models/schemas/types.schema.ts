import { ObjectId } from "mongodb"
import { createSlug } from "~/utils/format"

interface TypesType {
    _id?: ObjectId
    title: string
    description: string
    fa_class_icon: string
    slug?: string
}

export default class Types {
    _id?: ObjectId
    title: string
    description: string
    fa_class_icon: string
    slug?: string

    constructor(types: TypesType) {
        this._id = types._id || new ObjectId()
        this.title = types.title || ''
        this.description = types.description || ''
        this.fa_class_icon = types.fa_class_icon || ''
        this.slug = types.slug || createSlug(types.title)
    }
}