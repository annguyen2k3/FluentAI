import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import clientRoutes from './routes/client/index.routes'
import adminRoutes from './routes/admin/index.routes'
import path from 'path'
import { databaseService } from './services/database.service'
import bodyParser from 'body-parser'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import cookieParser from 'cookie-parser'
import { initFolder } from './utils/file'
import systemConfigService from './services/system-config.service'
import geminiService from './services/gemini.service'
import promptService from './services/prompt.service'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

initFolder()
databaseService.connect().then(async () => {
  await Promise.all([
    systemConfigService.loadCache(),
    geminiService.loadCache(),
    promptService.loadCache()
  ])
  console.log('----Cache loaded successfully----')
  console.log('|      System config            |')
  console.log('|      Gemini config            |')
  console.log('|      Prompt config            |')
  console.log('---------------------------------')
})

// Serving static files
app.use(express.static(`${__dirname}/public`))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())

// View engine setup
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '/views'))

app.locals.prefixAdmin = process.env.PREFIX_ADMIN

// ROUTES
clientRoutes(app)
adminRoutes(app)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`FluentAI app listening on port ${port}`)
})
