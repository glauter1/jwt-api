const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Reader = db.define('Reader', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpf: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        unique: true,
    },
    email: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    }
});
module.exports = Reader;
  