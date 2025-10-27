import express from 'express'
import dotenv from 'dotenv'
import clientRoutes from './routes/client/index.routes'
import path from 'path'
import { databaseService } from './services/database.service'
import bodyParser from 'body-parser'
import { defaultErrorHandler } from './middlewares/errors.middleware'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

databaseService.connect()

// Serving static files
app.use(express.static('src/public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// View engine setup
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../src/views'))


// ROUTES
clientRoutes(app)

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`FluentAI app listening on port ${port}`)
})
