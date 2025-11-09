import { Router } from 'express'
import { getSetupWritingSentenceController, getSystemListWSController, getWSListController } from '~/controllers/client/writing.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handlers'
const writingSentenceRoutes = Router()

// GET /writing-sentence/setup
// Description: Render setup writing sentence page
// Method: GET
writingSentenceRoutes.get('/setup', requireAuth, wrapRequestHandler(getSetupWritingSentenceController))

// GET /writing-sentence/system-topic
// Description: Render system topic writing sentence page
// Method: GET
writingSentenceRoutes.get(
    '/system-list',
    requireAuth,
    wrapRequestHandler(getSystemListWSController)
)

// GET /writing-sentence/list
// Description: Get list of writing sentences
// Method: GET
// Params: level, topic
writingSentenceRoutes.get(
    '/list',
    requireAuth,
    wrapRequestHandler(getWSListController)
)

export default writingSentenceRoutes