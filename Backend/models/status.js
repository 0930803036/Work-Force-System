'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Status extends Model {
    static associate(models) {
      // One-to-many: A status can be assigned to many requests
      Status.hasMany(models.Request, {
        foreignKey: 'statusName',  // use statusName as foreign key in Request
        onDelete: 'SET NULL',       // when a status is deleted, set request.statusName to NULL
        onUpdate: 'CASCADE',        // propagate updates
      });
      // Many-to-one: A status belongs to a user
      Status.belongsTo(models.User, {
        foreignKey: 'userId',       // foreign key in Status table
        onDelete: 'SET NULL',     // when a user is deleted, set status.userId to NULL
        onUpdate: 'CASCADE',      // propagate updates
      });
    }
  }

  Status.init(
    {
      userId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      statusName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Status',
      tableName: 'Statuses', // explicit table name
      timestamps: true,      // adds createdAt and updatedAt
    }
  );

  return Status;
};
