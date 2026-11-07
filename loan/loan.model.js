const db = require('../config/db');
const { DataTypes } = require('sequelize');
const loan = db.define('Loan', {
    loanDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    returnDate: {
        type: DataTypes.DATEONLY,
    
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'ativo',
    },
    fine: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    }
});
module.exports = loan;