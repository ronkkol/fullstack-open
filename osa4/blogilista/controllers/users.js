const { hash } = require('bcrypt')
const router = require('express').Router()
const User = require('../models/user')

const saltRounds = 10

router.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

router.post('/', async (request, response) => {
  const { username, name, password } = request.body
  if (!username || !password) {
    throw {
      name: 'ValidationError',
      message: 'username and password are required'
    }
  }

  if (password.length < 3) {
    throw {
      name: 'ValidationError',
      message: 'password is too short'
    }
  }

  const pwdHash = await hash(password, saltRounds)
  const user = await new User({ username, name, passwordHash: pwdHash }).save()

  response.status(201).json(user)
})

module.exports = router
