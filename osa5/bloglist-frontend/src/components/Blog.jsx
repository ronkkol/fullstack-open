import { useState } from 'react'
import blogService from '../services/blogs'

const Blog = ({
  blog,
  isOwnedByUser,
  onLike,
  onLikeFailed,
  onDelete,
  onDeleteFailed
}) => {
  const [showMore, setShowMore] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const handleLike = async (event) => {
    event.preventDefault()
    try {
      const updated = await blogService.update(blog.id, {
        ...blog,
        user: blog.user ? blog.user.id : null,
        likes: blog.likes + 1
      })
      onLike(updated)
    } catch (exception) {
      console.error(exception)
      onLikeFailed()
    }
  }

  const handleDelete = async (event) => {
    event.preventDefault()
    if (window.confirm(`delete ${blog.title} by ${blog.author}`)) {
      try {
        await blogService.deletePost(blog.id)
        onDelete(blog.id)
      } catch (exception) {
        console.error(exception)
        onDeleteFailed()
      }
    }
  }

  return (
    <div style={blogStyle}>
      {blog.title} {blog.author}{' '}
      <button onClick={() => setShowMore(!showMore)}>
        {showMore ? 'hide' : 'view'}
      </button>
      {showMore && (
        <div>
          {blog.url}
          <br />
          likes {blog.likes}
          <button onClick={handleLike}>like</button>
          <br />
          {blog.user && blog.user.name}
          <br />
          {isOwnedByUser && <button onClick={handleDelete}>remove</button>}
        </div>
      )}
    </div>
  )
}

export default Blog
