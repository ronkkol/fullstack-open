const {
  test,
  expect,
  beforeEach,
  describe,
  afterEach
} = require('@playwright/test')

describe('Bloglist app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http:localhost:5173/api/testing/reset')
    await request.post('http://localhost:5173/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('http://localhost:5173/api/users', {
      data: {
        name: 'Arto Hellas',
        username: 'ahellas',
        password: 'salainen'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await page.goto('http://localhost:5173')

    const locator = await page.getByText('login to application')
    expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByTestId('login-username').fill('mluukkai')
      await page.getByTestId('login-password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByTestId('login-username').fill('mluukkai')
      await page.getByTestId('login-password').fill('incorrect')
      await page.getByRole('button', { name: 'login' }).click()

      await expect(page.getByText('wrong credentials')).toBeVisible()
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId('login-username').fill('mluukkai')
      await page.getByTestId('login-password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new post' }).click()
      await page
        .getByTestId('blogform-title')
        .fill('a note created by playwright')
      await page
        .getByTestId('blogform-url')
        .fill('https://example.com/posts/playwright-blog')
      await page.getByRole('button', { name: 'create' }).click()

      await expect(
        page.getByTestId('bloglist').getByText('a note created by playwright')
      ).toBeVisible()
    })

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new post' }).click()
        await page
          .getByTestId('blogform-title')
          .fill('a note created by playwright')
        await page
          .getByTestId('blogform-url')
          .fill('https://example.com/posts/playwright-blog')
        await page.getByRole('button', { name: 'create' }).click()
      })

      test('it can be liked', async ({ page }) => {
        await page
          .getByTestId('bloglist')
          .getByRole('button', { name: 'view' })
          .click()
        await page.getByTestId('blog-likebutton').click()

        await expect(page.getByTestId('blog-likecount')).toHaveText('likes 1')
      })

      test('it can be removed', async ({ page }) => {
        await page
          .getByTestId('bloglist')
          .getByRole('button', { name: 'view' })
          .click()

        page.on('dialog', (dialog) => dialog.accept())
        await page.getByTestId('blog-removebutton').click()

        await expect(page.getByTestId('bloglist')).not.toHaveText(
          'a note created by playwright'
        )

        await page.screenshot({ path: 'screenshot.png' })
      })

      describe('and another user logs in', () => {
        beforeEach(async ({ page }) => {
          await page.getByRole('button', { name: 'logout' }).click()
          await page.getByTestId('login-username').fill('ahellas')
          await page.getByTestId('login-password').fill('salainen')
          await page.getByRole('button', { name: 'login' }).click()
        })

        test('it cannot be removed', async ({ page }) => {
          await page
            .getByTestId('bloglist')
            .getByRole('button', { name: 'view' })
            .click()

          await expect(page.getByTestId('blog-removebutton')).toBeHidden()
        })
      })

      describe('and another blof exists', () => {
        beforeEach(async ({ page }) => {
          await page.getByRole('button', { name: 'new post' }).click()
          await page
            .getByTestId('blogform-title')
            .fill('another note created by playwright')
          await page
            .getByTestId('blogform-url')
            .fill('https://example.com/posts/playwright-blog-2')
          await page.getByRole('button', { name: 'create' }).click()
        })

        test('blogs are ordered by likes', async ({ page }) => {
          await page
            .getByTestId('bloglist')
            .getByRole('button', { name: 'view' })
            .first()
            .click()
          await page.getByTestId('blog-likebutton').click()
          await page
            .getByTestId('bloglist')
            .getByRole('button', { name: 'hide' })
            .click()

          await page
            .getByTestId('bloglist')
            .getByRole('button', { name: 'view' })
            .last()
            .click()
          await page.getByTestId('blog-likebutton').click()
          await page.getByTestId('blog-likebutton').click()

          await page
            .getByTestId('bloglist')
            .getByRole('button', { name: 'view' })
            .click()

          const likes = await page.$$eval(
            '[data-testid=blog-likecount]',
            (elements) => elements.map((el) => el.textContent)
          )

          expect(likes).toEqual(['likes 2', 'likes 1'])
        })
      })
    })
  })
})
