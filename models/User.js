const Sequelize = require('sequelize');

function defineUser(database) {
    const User = database.define('user', {
        username : { type: Sequelize.STRING } ,
        password : { type: Sequelize.STRING } ,
        pseudo : { type: Sequelize.STRING}
    });
    User.associate = (models) => {
        models.User.hasMany(models.Post);
    };
    return User
}

module.exports = defineUser;
