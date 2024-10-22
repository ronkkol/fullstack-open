require('dotenv').config()
require('express-async-errors')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const blogRoutes = require('./controllers/blogs')
const userRoutes = require('./controllers/users')
const loginRoutes = require('./controllers/login')
const { info } = require('./utils/logger')
const { MONGODB_URI } = require('./utils/config')
const errorHandler = require('./middleware/errors')
const tokenExtractor = require('./middleware/token')
const userExtractor = require('./middleware/user')

const mongoUrl = MONGODB_URI
if (!mongoUrl) {
  info('No MONGODB_URI provided')
  process.exit(1)
}
mongoose.connect(mongoUrl)

const app = express()

app.use(cors())
app.use(express.json())
app.use(tokenExtractor)

app.use('/api/blogs', userExtractor, blogRoutes)
app.use('/api/users', userRoutes)
app.use('/api/login', loginRoutes)
app.use(errorHandler)

module.exports = app
