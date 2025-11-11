import { ObjectId } from "mongodb"
import { VocabularyHintType } from "../Other"

export type SentenceWriteType = {
    pos: number,
    content: string;
    hint: VocabularyHintType[];
}

interface WSListType {
    _id?: ObjectId
    title: string
    topic: ObjectId
    level: ObjectId
    list : SentenceWriteType[]
    pos: number
    slug: string
    create_at: Date
    update_at: Date
}

export default class WSList {
    _id?: ObjectId
    title: string
    topic: ObjectId
    level: ObjectId
    list : SentenceWriteType[]
    pos: number
    slug: string
    create_at: Date
    update_at: Date

    constructor(wsList: WSListType) {
        this._id = wsList._id || new ObjectId()
        this.title = wsList.title || ''
        this.topic = wsList.topic || new ObjectId()
        this.level = wsList.level || new ObjectId()
        this.list = wsList.list || []
        this.pos = wsList.pos || 0
        this.slug = wsList.slug || ''
        this.create_at = wsList.create_at || new Date()
        this.update_at = wsList.update_at || new Date()
    }
}