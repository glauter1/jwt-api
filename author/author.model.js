const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Author = db.define('Author', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nationality: {
        type: DataTypes.STRING,
      
    },
    birthdate: {
        type: DataTypes.DATE,
       
    }
});

module.exports = Author;