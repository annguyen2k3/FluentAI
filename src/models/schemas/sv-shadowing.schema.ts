import { ObjectId } from 'mongodb'
import { createSlug } from '~/utils/format'

export type ShadowingSentenceType = {
  startTime: number
  endTime: number
  enText: string
  viText: string
  phonetics: string
}

interface SVShadowingType {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  videoUrl: string
  thumbnailUrl?: string
  transcript: ShadowingSentenceType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date
}

export default class SVShadowing {
  _id?: ObjectId
  title: string
  topic: ObjectId
  level: ObjectId
  videoUrl: string
  thumbnailUrl?: string
  source?: string
  transcript: ShadowingSentenceType[]
  pos?: number
  slug?: string
  isActive?: boolean
  create_at?: Date
  update_at?: Date

  constructor(svShadowing: SVShadowingType) {
    this._id = svShadowing._id || new ObjectId()
    this.title = svShadowing.title || ''
    this.topic = svShadowing.topic
    this.level = svShadowing.level
    this.videoUrl = svShadowing.videoUrl
    this.thumbnailUrl =
      svShadowing.thumbnailUrl ||
      this.generateThumbnailUrl(svShadowing.videoUrl)
    this.transcript = svShadowing.transcript || []
    this.pos = svShadowing.pos || 1
    this.slug = svShadowing.slug || createSlug(svShadowing.title)
    this.isActive = svShadowing.isActive ?? true
    this.create_at = svShadowing.create_at || new Date()
    this.update_at = svShadowing.update_at || new Date()
  }

  // Helper method để tự động tạo thumbnail URL từ YouTube video ID
  private generateThumbnailUrl(videoUrl: string): string {
    const videoId = this.extractVideoId(videoUrl)
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return ''
  }

  // Helper method để extract video ID từ YouTube URL
  private extractVideoId(url: string): string | null {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }
}
