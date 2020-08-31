const postsResolvers = require('./posts');
const userResolvers = require('./users');

module.exports = {
    
    Post: {
        likesCount: (parent) => {
            return parent.likes.length;
        },
        commentsCount: (parent) => {
            return parent.comments.length;
        }
    },

    Query: {
        ...postsResolvers.Query
    },

    Mutation: {
        ...userResolvers.Mutation,
        ...postsResolvers.Mutation
    }
}