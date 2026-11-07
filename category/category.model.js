const db = require('../config/db');
const { DataTypes } = require('sequelize');

const category = db.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
    
    }
});

module.exports = category;