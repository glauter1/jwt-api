const { DataTypes } = require('sequelize');
const db = require('../config/db');

const RefreshToken = db.define('RefreshToken', {
  token: { type: DataTypes.STRING, allowNull: false, unique: true },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = RefreshToken;