import { Router } from 'express'
import { getSetupWritingSentenceController } from '~/controllers/client/writing.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const writingSentenceRoutes = Router()

// GET /writing/sentence/setup
// Description: Render setup writing sentence page
// Method: GET
writingSentenceRoutes.get('/setup', requireAuth, wrapRequestHandler(getSetupWritingSentenceController))

export default writingSentenceRoutes