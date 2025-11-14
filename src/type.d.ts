import { Request } from 'express'

declare module 'express' {
  interface Request {
    user?: User
    admin?: Admin
    ws?: WSList
    wp?: WPParagraph
    level?: Levels
    type?: Types
    topic?: Topics
  }
}
