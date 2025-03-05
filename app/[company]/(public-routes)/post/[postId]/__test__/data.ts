export const comments = [
  {
    id: "comment-1",
    comment: "This is a great post!",
    userId: "user-1",
    postId: "post-1",
    parentId: null, // Top-level comment
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    replies: [
      {
        id: "comment-3",
        comment: "Thanks, Alice!",
        userId: "user-2",
        postId: "post-1",
        parentId: "comment-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        replies: [
          {
            id: "comment-5",
            comment: "You're welcome, Bob!",
            userId: "user-1",
            postId: "post-1",
            parentId: "comment-3",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [],
          },

          {
            id: "comment-3",
            comment: "Thanks, Alice!",
            userId: "user-2",
            postId: "post-1",
            parentId: "comment-1",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [
              {
                id: "comment-5",
                comment: "You're welcome, Bob!",
                userId: "user-1",
                postId: "post-1",
                parentId: "comment-3",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                replies: [],
              },
            ],
          },
        ],
      },
    ],
    likes: [],
  },
  {
    id: "comment-2",
    comment: "I totally agree!",
    userId: "user-2",
    postId: "post-1",
    parentId: null, // Another top-level comment
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    replies: [
      {
        id: "comment-4",
        comment: "Me too! This is insightful.",
        userId: "user-1",
        postId: "post-1",
        parentId: "comment-2",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        replies: [
          {
            id: "comment-6",
            comment: "Couldn't agree more!",
            userId: "user-2",
            postId: "post-1",
            parentId: "comment-4",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [],
          },
        ],
      },
    ],
    likes: [],
  },
  {
    id: "comment-2",
    comment: "I totally agree!",
    userId: "user-2",
    postId: "post-1",
    parentId: null, // Another top-level comment
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    replies: [
      {
        id: "comment-4",
        comment: "Me too! This is insightful.",
        userId: "user-1",
        postId: "post-1",
        parentId: "comment-2",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        replies: [
          {
            id: "comment-6",
            comment: "Couldn't agree more!",
            userId: "user-2",
            postId: "post-1",
            parentId: "comment-4",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [],
          },
        ],
      },
    ],
    likes: [],
  },
  {
    id: "comment-2",
    comment: "I totally agree!",
    userId: "user-2",
    postId: "post-1",
    parentId: null, // Another top-level comment
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    replies: [
      {
        id: "comment-4",
        comment: "Me too! This is insightful.",
        userId: "user-1",
        postId: "post-1",
        parentId: "comment-2",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        replies: [
          {
            id: "comment-6",
            comment: "Couldn't agree more!",
            userId: "user-2",
            postId: "post-1",
            parentId: "comment-4",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [],
          },
        ],
      },
    ],
    likes: [],
  },
  {
    id: "comment-2",
    comment: "I totally agree!",
    userId: "user-2",
    postId: "post-1",
    parentId: null, // Another top-level comment
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    replies: [
      {
        id: "comment-4",
        comment: "Me too! This is insightful.",
        userId: "user-1",
        postId: "post-1",
        parentId: "comment-2",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        replies: [
          {
            id: "comment-6",
            comment: "Couldn't agree more!",
            userId: "user-2",
            postId: "post-1",
            parentId: "comment-4",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [],
          },
        ],
      },
    ],
    likes: [],
  },
  {
    id: "comment-2",
    comment: "I totally agree!",
    userId: "user-2",
    postId: "post-1",
    parentId: null, // Another top-level comment
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    replies: [
      {
        id: "comment-4",
        comment: "Me too! This is insightful.",
        userId: "user-1",
        postId: "post-1",
        parentId: "comment-2",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        replies: [
          {
            id: "comment-6",
            comment: "Couldn't agree more!",
            userId: "user-2",
            postId: "post-1",
            parentId: "comment-4",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            replies: [],
          },
        ],
      },
    ],
    likes: [],
  },
];

const likes = [
  {
    id: "like-1",
    userId: "user-1",
    commentId: "comment-2",
  },
  {
    id: "like-2",
    userId: "user-2",
    commentId: "comment-1",
  },
];

const users = [
  {
    id: "user-1",
    name: "Alice",
  },
  {
    id: "user-2",
    name: "Bob",
  },
];

const posts = [
  {
    id: "post-1",
    title: "First Post",
    content: "This is the first post.",
    userId: "user-1",
  },
  {
    id: "post-2",
    title: "Second Post",
    content: "This is the second post.",
    userId: "user-2",
  },
];

module.exports = { users, posts, comments, likes };
