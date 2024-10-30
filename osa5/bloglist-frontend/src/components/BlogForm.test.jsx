import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect } from 'vitest'
import BlogForm from './BlogForm'

describe('<BlogForm />', () => {
  test('calls props.onSubmit with correct data', async () => {
    const data = {
      title: 'sampletitle',
      author: 'sampleauthor',
      url: 'sampleurl'
    }

    const mockSubmit = vi.fn()
    render(<BlogForm onSubmit={mockSubmit} />)
    const titleField = screen.getByLabelText('title:')
    const authorField = screen.getByLabelText('author:')
    const urlField = screen.getByLabelText('url:')
    const submit = screen.getByText('create')

    const user = userEvent.setup()

    await user.type(titleField, data.title)
    await user.type(authorField, data.author)
    await user.type(urlField, data.url)

    await userEvent.click(submit)

    expect(mockSubmit.mock.calls[0]).toEqual([
      data.title,
      data.author,
      data.url
    ])
  })
})
