'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
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

  User.init(
    {
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
      lockedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'User',

      // ✅ CORRECT for your DB
      tableName: 'Users',
      freezeTableName: true,

      timestamps: true,
    }
  );

  return User;
};
