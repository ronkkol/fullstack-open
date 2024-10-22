const errorHandler = (error, _request, response, next) => {
  if (error.name === 'NotFoundError') {
    return response.status(404).json({ error: error.message })
  } else if (error.name === 'AuthenticationError') {
    return response.status(401).json({ error: error.message })
  } else if (error.name === 'UnauthenticatedError') {
    return response.status(401).json({ error: error.message })
  } else if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return response
      .status(400)
      .json({ error: 'expected `username` to be unique' })
  }

  next(error)
}

module.exports = errorHandler
