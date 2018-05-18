const Sequelize = require('sequelize');

function definePost(database) {
    const Post = database.define('post', {
        title: {
            type: Sequelize.STRING
        },
        content: {
            type: Sequelize.TEXT
        },
    }, {
        getterMethods: {
            score() {
                return this.getDataValue('notes').reduce((total, note) => {
                    if (note.type === 'up') {
                        return total + 1;
                    }

                    if (note.type === 'down') {
                        return total - 1;
                    }

                    return total;
                }, 0);
            }
        }
    });
    Post.associate = (models) => {
        models.Post.hasMany(models.Note);
        models.Post.belongsTo(models.User);
    };
    return Post;
}

module.exports = definePost;
