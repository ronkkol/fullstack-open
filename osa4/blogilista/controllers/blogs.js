const router = require('express').Router()
const Blog = require('../models/blog')

router.get('/', async (_request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

router.post('/', async (request, response) => {
  if (!request.user) {
    throw {
      name: 'UnauthenticatedError',
      message: 'Unauthorized'
    }
  }
  const { likes, title, url } = request.body
  if (!title || !url) {
    throw {
      name: 'ValidationError',
      message: 'title and url are required'
    }
  }

  const blog = await new Blog({
    ...request.body,
    likes: likes ?? 0,
    user: request.user.id
  }).save()

  response.status(201).json(blog)
})

router.delete('/:id', async (request, response) => {
  if (!request.user) {
    throw {
      name: 'UnauthenticatedError',
      message: 'Unauthorized'
    }
  }
  const { id } = request.params
  if (!id) {
    throw {
      name: 'ValidationError',
      message: 'missing id from params'
    }
  }

  const post = await Blog.findById(id)
  if (!post) {
    throw {
      name: 'NotFoundError',
      message: `Post with id ${id} not found`
    }
  }

  if (post.user.toString() !== request.user.id) {
    throw {
      name: 'AuthenticationError',
      message: 'You do not own this post'
    }
  }

  await Blog.findByIdAndDelete(id)

  response.status(204).end()
})

router.put('/:id', async (request, response) => {
  const { id } = request.params
  if (!id) {
    throw {
      name: 'ValidationError',
      message: 'missing id from params'
    }
  }
  const { title, url } = request.body
  if (!title || !url) {
    throw {
      name: 'ValidationError',
      message: 'title and url are required'
    }
  }

  const updated = await Blog.findByIdAndUpdate(id, request.body, { new: true })
  if (!updated) {
    throw {
      name: 'NotFoundError',
      message: `Post with id ${id} not found`
    }
  }

  response.json(updated)
})

module.exports = router
