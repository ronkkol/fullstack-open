const router = require('express').Router()
const Blog = require('../models/blog')

router.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

router.post('/', async (request, response) => {
  const { likes, title, url } = request.body
  if (!title || !url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const blog = await new Blog({
    ...request.body,
    likes: likes ?? 0
  }).save()

  response.status(201).json(blog)
})

router.delete('/:id', async (request, response) => {
  const { id } = request.params
  if (!id) {
    return response.status(400).json({ error: 'missing id from params' })
  }

  const deleted = await Blog.findByIdAndDelete(id)
  if (!deleted) {
    return response.status(404).json({ error: `Post with id ${id} not found` })
  }

  response.status(204).end()
})

router.put('/:id', async (request, response) => {
  const { id } = request.params
  if (!id) {
    return response.status(400).json({ error: 'missing id from params' })
  }
  const { title, url } = request.body
  if (!title || !url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const updated = await Blog.findByIdAndUpdate(id, request.body, { new: true })
  if (!updated) {
    return response.status(404).json({ error: `Post with id ${id} not found` })
  }

  response.json(updated)
})

module.exports = router
