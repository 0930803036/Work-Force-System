'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ---------------------------
      // Shift belongs to Configuration
      // ---------------------------
      Shift.belongsTo(models.Configuration, { 
        foreignKey: 'shiftName',    // links shiftName in Shift to shiftName in Configuration
        targetKey: 'shiftName',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ---------------------------
      // Shift belongs to User
      // ---------------------------
      // This is to track who created the shift
      Shift.belongsTo(models.User, { 
        foreignKey: 'userId',    // alias to clarify relationship
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      // ---------------------------
      // Shift has many Requests
      // ---------------------------
      // This links requests to their shift
      Shift.hasMany(models.Request, { 
        foreignKey: 'shiftName',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }

  // ---------------------------
  // Initialize Shift model
  // ---------------------------
  Shift.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,           // must always have a creator
    },
    shiftName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shiftStart: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    shiftEnd: {
      type: DataTypes.TIME,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Shift',
    timestamps: true, // optional: adds createdAt and updatedAt
  });

  return Shift;
};
