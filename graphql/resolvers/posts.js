const { AuthenticationError } = require('apollo-server');

const Post = require('../../models/Post');
const checkAuth = require('../../utils/check_auth');

const { UserInputError } = require('apollo-server');
const { validatePostInput } = require('../../utils/Validators');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find({}).sort({ createdAt: -1 });
                return posts;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getPost (_, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } else {
                    throw new Error('Post not found');
                }
            } catch (error) {
                throw new Error(error);
            }
        }
    },
    Mutation: {
        async createPost (_, { body }, context) {

            const user = checkAuth(context);

            const { errors, valid } = validatePostInput(body);

            if (!valid) {
                throw new UserInputError('Post body must not be empty.' , { errors });
            }

            const newPost = new Post({
                body,
                user: user._id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();

            return post;
        },

        async deletePost (_, { postId }, context) {
            const user = checkAuth(context);

            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    await post.deleteOne();
                    return "Post deleted successfully."
                } else {
                    throw new AuthenticationError('Action is not allowed.');
                }
            } catch (error) {
                throw new Error(error);
            }
        },

        async createComment (_, { postId, body }, context) {
            const { username } = checkAuth(context);

            if (body.trim() === '') {
                throw new UserInputError('Empty comment field', {
                    errors: {
                        body: 'Comment body must not be empty.'
                    }
                })
            }

            const post = await Post.findById(postId);

            if (post) {
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })

                await post.save();

                return post;
            }else {
                throw new UserInputError('Post not found.');
            }
        },

        async deleteComment (_, { postId, commentId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                const commentIndex = post.comments.findIndex( c => c.id === commentId);

                if (post.comments[commentIndex].username === username) {
                    post.comments.splice(commentIndex, 1);
                    await post.save();
                    return post;
                }else {
                    throw new AuthenticationError('Action is not allowed');
                }
            } else {
                throw new UserInputError('Post not found.');
            }
        },

        async likePost (_, { postId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if (post) {
                if (post.likes.find(like => like.username === username)) {
                    post.likes = post.likes.filter( like => like.username !== username);
                }else {
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }

                await post.save();

                return post;
            } else throw new UserInputError('Post not found.');
        }
    }
}