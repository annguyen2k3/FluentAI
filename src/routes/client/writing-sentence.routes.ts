import { Router } from 'express'
import { getCompleteWSController, getPracticeWSController, getSetupWritingSentenceController, getSystemListWSController, getWSListController, postCustomTopicPreviewWSController, postPracticeWSController } from '~/controllers/client/writing.controllers'
import { requireAuth } from '~/middlewares/users.middleware'
import { postCustomTopicPreviewWSValidator, postPracticeWSValidator, renderWSPraticeValidator } from '~/middlewares/writing-sentence.middleware'
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

// GET /writing-sentence/practice/:slug
// Description: Render practice writing sentence page
// Method: GET
writingSentenceRoutes.get(
    '/practice/:slug',
    requireAuth,
    renderWSPraticeValidator,
    wrapRequestHandler(getPracticeWSController)
)

// POST /writing-sentence/practice/:slug
// Description: Post practice writing sentence page
// Method: POST
writingSentenceRoutes.post(
    '/practice/:slug',
    requireAuth,
    renderWSPraticeValidator,
    postPracticeWSValidator,
    wrapRequestHandler(postPracticeWSController)
)

// GET /writing-sentence/practice/:slug/complete
// Description: Render complete writing sentence page
// Method: GET
writingSentenceRoutes.get(
    '/practice/complete/:slug',
    requireAuth,
    renderWSPraticeValidator,
    wrapRequestHandler(getCompleteWSController)
)

writingSentenceRoutes.post(
    '/custom-topic/preview',
    requireAuth,
    postCustomTopicPreviewWSValidator,
    wrapRequestHandler(postCustomTopicPreviewWSController)
)

export default writingSentenceRoutes