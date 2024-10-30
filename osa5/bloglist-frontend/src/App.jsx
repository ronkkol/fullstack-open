import './style/main.css'
import { useState, useEffect } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const onLogout = () => {
    loginService.clearData()
    blogService.setToken(undefined)
    setUser(null)
  }

  const onLogin = async (username, password) => {
    try {
      const user = await loginService.login({
        username,
        password
      })

      loginService.saveUser(user)
      blogService.setToken(user.token)

      setUser(user)
      setSuccessMessage(`Welcome ${user.name}`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (exception) {
      console.error(exception)
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const onSubmit = async (title, author, url) => {
    try {
      const newBlog = await blogService.create({ title, author, url })
      setBlogs(blogs.concat(newBlog))
      setSuccessMessage(
        `a new blog ${newBlog.title} by ${newBlog.author} added`
      )
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (exception) {
      console.error(exception)
      setErrorMessage('failed to create blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs))
  }, [])

  useEffect(() => {
    const loggedUserJSON = loginService.loadUser()
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  if (!user) {
    return (
      <div>
        <h2>login to application</h2>
        {errorMessage && <Notification message={errorMessage} type="error" />}
        {successMessage && (
          <Notification message={successMessage} type="success" />
        )}
        <LoginForm onSubmit={onLogin} />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      {errorMessage && <Notification message={errorMessage} type="error" />}
      {successMessage && (
        <Notification message={successMessage} type="success" />
      )}
      <div>
        {user.name} logged in <button onClick={onLogout}>logout</button>
      </div>
      <br />
      <div>
        <h2>create new</h2>
        <BlogForm onSubmit={onSubmit} />
        {blogs.map((blog) => (
          <Blog key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}

export default App
