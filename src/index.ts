import express from 'express'
import dotenv from 'dotenv'
import clientRoutes from './routes/client/index.routes'
import path from 'path'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Serving static files
app.use(express.static('src/public'))

// View engine setup
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../src/views'))

// ROUTES
clientRoutes(app)

app.listen(port, () => {
  console.log(`FluentAI app listening on port ${port}`)
})
