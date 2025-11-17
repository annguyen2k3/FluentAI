import express from 'express'
import dotenv from 'dotenv'
import clientRoutes from './routes/client/index.routes'
import adminRoutes from './routes/admin/index.routes'
import path from 'path'
import { databaseService } from './services/database.service'
import bodyParser from 'body-parser'
import { defaultErrorHandler } from './middlewares/errors.middleware'
import cookieParser from 'cookie-parser'
import { initFolder } from './utils/file'

import './utils/gemini'
import { sendMail } from './utils/nodemailer'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

initFolder()
databaseService.connect()

// Serving static files
app.use(express.static('src/public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())

// View engine setup
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../src/views'))

app.locals.prefixAdmin = process.env.PREFIX_ADMIN

// ROUTES
clientRoutes(app)
adminRoutes(app)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`FluentAI app listening on port ${port}`)
})
