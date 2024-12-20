const jwt = require('jsonwebtoken')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./helpers/blog_helper')
const userHelper = require('./helpers/user_helper')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

let token = null
let user = null

describe('when some blogs are initialized to the database', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const promises = helper.initialBlogs.map(async (blog) => {
      const blogObject = new Blog(blog)
      return blogObject.save()
    })
    await Promise.all(promises)

    const randomUser =
      userHelper.initialUsers[
        Math.floor(Math.random() * userHelper.initialUsers.length)
      ]

    const response = await api.post('/api/login').send(randomUser)
    token = response.body.token
  })

  test('GET /api/blogs are returns json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('GET /api/blogs returns the correct number of blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('returned blogs have an id property', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => assert.ok(blog.id))
  })

  test('POST /api/blogs creates a new blog post', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'New author',
      url: 'https://example.com/blogs/new-blog',
      likes: 0
    }
    const { id } = jwt.decode(token)

    const response = await api
      .post('/api/blogs')
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const { user } = response.body
    assert.strictEqual(user, id)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
  })

  test('POST /api/blogs sets the likes property to 0 if it is missing', async () => {
    const newBlog = {
      title: 'New blog',
      author: 'New author',
      url: 'https://example.com/blogs/new-blog'
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
    const { likes } = response.body
    assert.strictEqual(likes, 0)
  })

  test('POST /api/blogs responds with 400 if title or url is missing', async () => {
    const noTitle = {
      author: 'New author',
      url: 'https://example.com/blogs/new-blog'
    }
    const noUrl = {
      title: 'New blog',
      author: 'New author'
    }

    await api
      .post('/api/blogs')
      .send(noTitle)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
    await api
      .post('/api/blogs')
      .send(noUrl)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })

  test('POST /api/blogs responds with 401 if token is missing', async () => {
    const newBlog = {
      title: 'New blog',
      url: 'https://example.com/blogs/new-blog'
    }

    await api.post('/api/blogs').send(newBlog).expect(401)
  })

  test('POST /api/blogs responds with 401 if token is invalid', async () => {
    const newBlog = {
      title: 'New blog',
      url: 'https://example.com/blogs/new-blog'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .withCredentials()
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
  })

  test('DELETE /api/blogs/:id deletes a blog post', async () => {
    // Create a new blog post as user
    const newBlog = {
      title: 'New blog',
      url: 'https://example.com/blogs/new-blog'
    }
    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
    const { id } = response.body

    // Delete the blog post
    await api
      .delete(`/api/blogs/${id}`)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert(!blogsAtEnd.some((blog) => blog.id === id))
  })

  test('DELETE /api/blogs/:id responds with 404 if the blog post does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('DELETE /api/blogs/:id responds with 401 if token is missing', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const { id } = blogsAtStart[0]

    await api.delete(`/api/blogs/${id}`).expect(401)
  })

  test('DELETE /api/blogs/:id responds with 401 if user does not own the post', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const { id } = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${id}`)
      .withCredentials()
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
  })

  test('PUT /api/blogs/:id updates a blog post', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const updated = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
    assert.strictEqual(updated.likes, blogToUpdate.likes + 1)
  })

  test('PUT /api/blogs/:id responds with 404 if the blog post does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()
    const blog = {
      title: 'New blog',
      author: 'New author',
      url: 'https://example.com/blogs/new-blog'
    }

    await api.put(`/api/blogs/${nonExistingId}`).send(blog).expect(404)
  })

  test('PUT /api/blogs/:id responds with 400 if title or url is missing', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const { id } = blogsAtStart[0]
    const noTitle = {
      author: 'New author',
      url: 'https://example.com/blogs/new-blog'
    }
    const noUrl = {
      title: 'New blog',
      author: 'New author'
    }

    await api.put(`/api/blogs/${id}`).send(noTitle).expect(400)
    await api.put(`/api/blogs/${id}`).send(noUrl).expect(400)
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
