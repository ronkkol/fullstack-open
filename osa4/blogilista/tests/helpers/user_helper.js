const User = require('../../models/user')

const initialUsers = [
  {
    username: 'root',
    name: 'Bootstrap user',
    password: 'password'
  },
  {
    username: 'user',
    name: 'User user',
    password: 'password'
  }
]

const nonExistingId = async () => {
  const user = new User({
    username: 'dummy',
    name: 'dummy',
    passwordHash: 'dummydummy'
  })
  await user.save()
  await user.deleteOne()

  return user._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  initialUsers,
  nonExistingId,
  usersInDb
}
