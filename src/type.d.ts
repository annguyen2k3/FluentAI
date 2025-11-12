import { Request } from 'express'

declare module 'express' {
  interface Request {
    user?: User
    ws?: WSList
    wp?: WPParagraph
    level?: Levels
    type?: Types
    topic?: Topics
  }
}
