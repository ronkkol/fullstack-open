import axios from 'axios'
const baseUrl = '/api/login'

const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

const saveUser = (user) => {
  window.localStorage.setItem('user', JSON.stringify(user))
}

const loadUser = () => window.localStorage.getItem('user')

const clearData = () => {
  window.localStorage.clear()
}

export default { login, saveUser, loadUser, clearData }
