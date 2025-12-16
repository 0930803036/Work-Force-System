'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Configuration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Each Configuration belongs to a User
      Configuration.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

      // Each Configuration has many Shifts
      Configuration.hasMany(models.Shift, {
        foreignKey: 'shiftName',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Configuration.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // name of the target table
          key: 'userId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      channel: DataTypes.STRING,
      skill: DataTypes.STRING,
      managerGroup: DataTypes.STRING,
      supervisorGroup: DataTypes.STRING,
      coachGroup: DataTypes.STRING,
      teamAvailability: DataTypes.INTEGER,
      shiftName: {
        type: DataTypes.STRING,
        references: {
          model: 'Shifts', // name of the target table
          key: 'shiftName',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      startTime: DataTypes.TIME,
      endTime: DataTypes.TIME,
      statusName: {             
        type: DataTypes.STRING,
        references: {
          model: 'Status', // name of the target table
          key: 'statusName'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    },
    {
      sequelize,
      modelName: 'Configuration',
    }
  );

  return Configuration;
};
