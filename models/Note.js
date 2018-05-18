const Sequelize = require('sequelize');

function defineNote(database) {
    const Note = database.define('note', {
        type: { type: Sequelize.ENUM('up', 'down') }
    });
    Note.associate = (models) => {
        models.Note.belongsTo(models.Post);
    };
    return Note;
}

module.exports = defineNote;
