import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import { describe } from 'vitest'

describe('<Blog />', () => {
  test('renders title and author but not url and likes', () => {
    const post = {
      title: 'sampletitle',
      author: 'sampleauthor',
      url: 'sampleurl',
      likes: 0
    }

    render(<Blog blog={post} />)

    expect(screen.getByText(/sampletitle/)).toBeDefined()
    expect(screen.getByText(/sampleauthor/)).toBeDefined()

    expect(screen.queryByText(/sampleurl/)).toBeNull()
    expect(screen.queryByText(/likes/)).toBeNull()
  })

  test('renders url and likes when view button is clicked', async () => {
    const post = {
      title: 'sampletitle',
      author: 'sampleauthor',
      url: 'sampleurl',
      likes: 0
    }

    render(<Blog blog={post} />)

    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    expect(screen.getByText(/sampleurl/)).toBeDefined()
    expect(screen.getByText(/likes/)).toBeDefined()
  })

  test('onLikeFailed is called when like button is clicked', async () => {
    const post = {
      title: 'sampletitle',
      author: 'sampleauthor',
      url: 'sampleurl',
      likes: 0
    }

    const mockLikeFailed = vi.fn()

    render(<Blog blog={post} onLikeFailed={mockLikeFailed} />)

    const user = userEvent.setup()
    const viewButton = screen.getByText('view')
    await user.click(viewButton)

    const likeButton = screen.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockLikeFailed.mock.calls.length).toBe(2)
  })
})
