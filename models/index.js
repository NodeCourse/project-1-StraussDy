const Sequelize = require('sequelize');
const Post = require('./Post');
const Note = require('./Note');
const User = require('./User');
const models = {};

models.database = new Sequelize('reviewGaming', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

models.Post = Post(models.database);
models.Note = Note(models.database);
models.User = User(models.database);

models.Post.associate(models);
models.Note.associate(models);
models.User.associate(models);

module.exports = models;