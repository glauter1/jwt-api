const db = require('../config/db');
const { DataTypes } = require('sequelize');

const Book = db.define('Book', {
title: {
         type: DataTypes.STRING,
          allowNull: false 
        },
  isbn: {
     type: DataTypes.STRING,
      allowNull: false, unique: true 
    },
  year: {
     type: DataTypes.INTEGER 
    },
  totalCopies: { 
    type: DataTypes.INTEGER,
     allowNull: false,
      defaultValue: 1 
    },
  availableCopies: {
     type: DataTypes.INTEGER,
      allowNull: false,
       defaultValue: 1 },
});
module.exports = Book;