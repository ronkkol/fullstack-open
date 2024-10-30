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

  const response = await axios.post(baseUrl, { title, author, url }, config)
  return response.data
}

const update = async (id, input) => {
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.put(`${baseUrl}/${id}`, input, config)
  return response.data
}

const deletePost = async (id) => {
  const config = {
    headers: { Authorization: token }
  }

  await axios.delete(`${baseUrl}/${id}`, config)
}

export default { setToken, getAll, create, update, deletePost }
