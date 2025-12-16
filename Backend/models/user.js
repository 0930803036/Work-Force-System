'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Status, {
        foreignKey: 'userId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      User.hasMany(models.Request, {
        foreignKey: 'userId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      User.hasMany(models.Configuration, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      User.hasMany(models.Shift, {
        foreignKey: 'userId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }
  User.init({
    userId: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    middleName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.INTEGER,
    role: DataTypes.STRING,
    delegatedRole: DataTypes.STRING,
    channel: DataTypes.STRING,
    skill: DataTypes.STRING,
    coachGroup: DataTypes.STRING,
    supervisorGroup: DataTypes.STRING,
    managerGroup: DataTypes.STRING,
    site: DataTypes.STRING,
    director: DataTypes.STRING,
    staffStatus: DataTypes.BOOLEAN,
    whiteList: DataTypes.BOOLEAN,
    password: DataTypes.STRING,
    failedLoginAttempts: DataTypes.INTEGER,
    accountStatus: DataTypes.BOOLEAN,
    lockedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};