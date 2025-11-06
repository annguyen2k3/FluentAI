import { Request, Response } from 'express'
import User from '~/models/schemas/users.schema'
import { databaseService } from '~/services/database.service'

export const getSetupWritingSentenceController = async (req: Request, res: Response) => {
  const user = req.user as User

  const levels = await databaseService.levels.find({}).toArray()

  res.render('client/pages/writing-sentence/setup.pug', { 
    pageTitle: 'Setup Writing Sentence', 
    user: user, 
    levels: levels 
})
}