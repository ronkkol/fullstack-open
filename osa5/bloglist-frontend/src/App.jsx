import './style/main.css'
import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const blogFormRef = useRef()

  const onLogout = () => {
    loginService.clearData()
    blogService.setToken(undefined)
    setUser(null)
  }

  const onLike = ({ id, likes, title }) => {
    setBlogs(
      blogs
        .map((blog) => (blog.id === id ? { ...blog, likes: likes } : blog))
        .sort((a, b) => b.likes - a.likes)
    )
    setSuccessMessage(`liked ${title}`)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const onLikeFailed = () => {
    setErrorMessage('failed to like post')
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const onDelete = (id) => {
    setBlogs(blogs.filter((blog) => blog.id !== id))
    setSuccessMessage('post deleted')
    setTimeout(() => {
      setSuccessMessage(null)
    }, 5000)
  }

  const onDeleteFailed = () => {
    setErrorMessage('failed to delete post')
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
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
      setBlogs(blogs.concat(newBlog).sort((a, b) => b.likes - a.likes))
      setSuccessMessage(
        `a new blog ${newBlog.title} by ${newBlog.author} added`
      )
      blogFormRef.current.toggleVisibility()
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
    blogService
      .getAll()
      .then((blogs) => setBlogs(blogs.sort((a, b) => b.likes - a.likes)))
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
      <Togglable buttonLabel="new post" ref={blogFormRef}>
        <h2>create new</h2>
        <BlogForm onSubmit={onSubmit} />
      </Togglable>
      <div>
        {blogs.map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            isOwnedByUser={blog.user && user.id === blog.user.id}
            onLike={onLike}
            onLikeFailed={onLikeFailed}
            onDelete={onDelete}
            onDeleteFailed={onDeleteFailed}
          />
        ))}
      </div>
    </div>
  )
}

export default App
