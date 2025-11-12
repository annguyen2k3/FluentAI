import { Request } from 'express'

declare module 'express' {
  interface Request {
    user?: User
    ws?: WSList
    level?: Levels
    type?: Types
    topic?: Topics
  }
}
