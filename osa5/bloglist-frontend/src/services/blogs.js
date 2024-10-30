import axios from 'axios'
const baseUrl = '/api/blogs'
let token

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

const create = async ({ title, author, url }) => {
  const config = {
    headers: { Authorization: token }
  }

  console.info('config:', config)

  const response = await axios.post(baseUrl, { title, author, url }, config)
  return response.data
}

export default { setToken, getAll, create }
