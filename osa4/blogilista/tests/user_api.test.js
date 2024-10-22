const { hash } = require('bcrypt')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./helpers/user_helper')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

describe.only('when some users are initialized to the database', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const promises = helper.initialUsers.map(async (user) => {
      const userObject = new User({
        ...user,
        passwordHash: await hash(user.password, 10)
      })
      return userObject.save()
    })
    await Promise.all(promises)
  })

  test('GET /api/users are returns json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('GET /api/users returns the correct number of users', async () => {
    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, helper.initialUsers.length)
  })

  test('POST /api/users creates a new user', async () => {
    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, helper.initialUsers.length + 1)
  })

  test('POST /api/users fails with status code 400 if username or password is missing', async () => {
    const noUsername = {
      name: 'No username',
      password: 'password'
    }
    const noPassword = {
      username: 'nopassword',
      name: 'No password'
    }

    await api
      .post('/api/users')
      .send(noUsername)
      .expect(400)
      .then((response) => {
        assert.strictEqual(
          response.body.error,
          'username and password are required'
        )
      })
    await api
      .post('/api/users')
      .send(noPassword)
      .expect(400)
      .then((response) => {
        assert.strictEqual(
          response.body.error,
          'username and password are required'
        )
      })
  })

  test('POST /api/users fails with status code 400 if username or password is less than 3 characters', async () => {
    const shortUsername = {
      username: 'us',
      name: 'Short username',
      password: 'password'
    }
    const shortPassword = {
      username: 'shortpassword',
      name: 'Short password',
      password: 'pw'
    }

    await api
      .post('/api/users')
      .send(shortUsername)
      .expect(400)
      .then((response) => {
        assert(response.body.error.includes('short'))
      })
    await api
      .post('/api/users')
      .send(shortPassword)
      .expect(400)
      .then((response) => {
        assert(response.body.error.includes('short'))
      })
  })

  test('POST /api/users fails with status code 400 if username is not unique', async () => {
    const newUser = {
      username: helper.initialUsers[0].username,
      name: 'New User',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .then((response) => {
        assert(response.body.error.includes('unique'))
      })
  })

  test('POST /api/login responds with 200 and a token if username and password match a user', async () => {
    const { username, password } = helper.initialUsers[0]
    const login = {
      username,
      password
    }

    await api
      .post('/api/login')
      .send(login)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .then((response) => {
        assert(response.body.token)
      })
  })

  test('POST /api/login responds with 401 if password is incorrect', async () => {
    const { username } = helper.initialUsers[0]
    const login = {
      username,
      password: 'incorrect'
    }

    await api
      .post('/api/login')
      .send(login)
      .expect(401)
      .then((response) => {
        assert(response.body.error.includes('invalid'))
      })
  })

  after(() => {
    mongoose.connection.close()
  })
})
