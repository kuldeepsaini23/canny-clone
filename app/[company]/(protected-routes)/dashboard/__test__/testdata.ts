export const posts = [
  {
    id: 1,
    title: "Call Scripts for Call Center / Clients or us + Ability to see them on mobile",
    likes: 23,
    comments: 23,
    status: "InDevelopment",
  },
  {
    id: 2,
    title: "Call Scripts for Call Center / Clients or us + Ability to see them on mobile",
    likes: 23,
    comments: 23,
    status: "InDevelopment",
  },
  {
    id: 3,
    title: "Call Scripts for Call Center / Clients or us + Ability to see them on mobile",
    likes: 23,
    comments: 23,
    status: "InDevelopment",
  },
  {
    id: 4,
    title: "Call Scripts for Call Center / Clients or us + Ability to see them on mobile",
    likes: 23,
    comments: 23,
    status: "InDevelopment",
  },
]

const morePosts = Array(20)
  .fill(null)
  .map((_, index) => ({
    id: posts.length + index + 1,
    title: `Additional post ${index + 1}`,
    likes: Math.floor(Math.random() * 50) + 1,
    comments: Math.floor(Math.random() * 30) + 1,
    status: ["InDevelopment", "Planned", "Completed"][Math.floor(Math.random() * 3)],
  }))

  export const allPosts = [...posts, ...morePosts]