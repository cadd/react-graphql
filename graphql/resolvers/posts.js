const Post = require('../../models/Post');
const checkAuth = require('../../utils/check_auth');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = Post.find();
                return posts;
            } catch (error) {
                throw new Error(error);
            }
        },
        async getPost (_, { postId }) {
            try {
                const post = Post.findById(postId);
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

            const newPost = new Post({
                body,
                user: user._id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();

            return post;
        }
    }
}