import { useState } from 'react'

const BlogForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setTitle('')
        setAuthor('')
        setUrl('')
        onSubmit(title, author, url)
      }}
    >
      <div>
        <label for="title">title:</label>
        <input
          type="text"
          data-testid="blogform-title"
          value={title}
          name="title"
          id="title"
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
        <label for="author">author:</label>
        <input
          type="text"
          data-testid="blogform-author"
          value={author}
          name="author"
          id="author"
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
        <label for="url">url:</label>
        <input
          type="text"
          data-testid="blogform-url"
          value={url}
          name="url"
          id="url"
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm
