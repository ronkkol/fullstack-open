const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')

const jwtSecret = process.env.SECRET
if (!jwtSecret) {
  console.error('No JWT secret provided')
  process.exit(1)
}

router.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    throw {
      name: 'AuthenticationError',
      message: 'invalid username or password'
    }
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(userForToken, jwtSecret)

  response
    .status(200)
    .send({ token, id: user.id, username: user.username, name: user.name })
})

module.exports = router
