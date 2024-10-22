require('dotenv').config()
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const blogRoutes = require('./controllers/blogs')
const { info } = require('./utils/logger')
const { MONGODB_URI } = require('./utils/config')

const mongoUrl = MONGODB_URI
if (!mongoUrl) {
  info('No MONGODB_URI provided')
  process.exit(1)
}
mongoose.connect(mongoUrl)

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogRoutes)

module.exports = app
