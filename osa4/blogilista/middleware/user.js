const jwt = require('jsonwebtoken')

const userExtractor = (request, _response, next) => {
  const token = request.token
  if (!token) {
    request.user = null
    return next()
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)
  request.user = decodedToken
  next()
}

module.exports = userExtractor
