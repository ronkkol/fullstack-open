/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 *
 * coutesy of mortb: https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
 */
function groupBy(list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

const dummy = (_blogs) => 1

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) =>
  blogs.length
    ? blogs.reduce(
        (max, blog) => (blog.likes > max.likes ? blog : max),
        blogs[0]
      )
    : null

const mostBlogs = (blogs) => {
  const grouped = groupBy(blogs, (blog) => blog.author)
  const authors = Array.from(grouped.keys())
  if (!authors.length) return null

  const authorWithMostBlogs = authors.reduce(
    (max, author) =>
      grouped.get(author).length > grouped.get(max).length ? author : max,
    authors[0]
  )

  return {
    author: authorWithMostBlogs,
    blogs: grouped.get(authorWithMostBlogs).length
  }
}

const mostLikes = (blogs) => {
  const grouped = groupBy(blogs, (blog) => blog.author)
  const authors = Array.from(grouped.keys())
  if (!authors.length) return null

  const authorWithMostLikes = authors.reduce(
    (max, author) =>
      totalLikes(grouped.get(author)) > totalLikes(grouped.get(max))
        ? author
        : max,
    authors[0]
  )

  return {
    author: authorWithMostLikes,
    likes: totalLikes(grouped.get(authorWithMostLikes))
  }
}

module.exports = {
  dummy,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  totalLikes
}
