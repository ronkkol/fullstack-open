require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { info } = require('./utils/logger')
const { PORT, MONGODB_URI } = require('./utils/config')
const blogRoutes = require('./controllers/blogs')
const mongoose = require('mongoose')

const mongoUrl = MONGODB_URI
if (!mongoUrl) {
  info('No MONGODB_URI provided')
  process.exit(1)
}
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogRoutes)

module.exports = app
