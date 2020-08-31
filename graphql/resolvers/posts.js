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
        }
    }
}