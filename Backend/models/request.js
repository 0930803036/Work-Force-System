'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Request extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Each Request belongs to a User
      Request.belongsTo(models.User, {
        foreignKey: 'userId',     // field in this table
        targetKey: 'userId',      // referenced field in Users table
        onUpdate: 'CASCADE',      // when userId in Users is updated, update here too
        onDelete: 'CASCADE',      // when a user is deleted, delete related requests
      });

      // Each Request belongs to a Status (flexible status tracking)
      Request.belongsTo(models.Status, {
        foreignKey: 'statusName',   // field in this table
        targetKey: 'statusName',    // referenced field in Status table
        as: 'statusDetails',        // optional alias for eager loading
        onUpdate: 'CASCADE',        // propagate updates from Status
        onDelete: 'SET NULL',       // if Status deleted, set statusName to NULL
      });

      // Each Request belongs to a Shift (detectable based on statusCreatedAt)
      Request.belongsTo(models.Shift, {
        foreignKey: 'shiftName',   // field in this table
        targetKey: 'shiftName',    // referenced field in Shift table
        onUpdate: 'CASCADE',       // propagate updates from Shift
        onDelete: 'SET NULL',      // if Shift deleted, set shiftName to NULL
      });
    }
  }

  Request.init(
    {
      // Foreign key linking to Users.userId
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',  // table name, not model name
          key: 'userId',   // column being referenced in Users
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // Tracks whether the request is for login or logout
      loginLogout: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Foreign key linking to Status.statusName
      statusName: {
        type: DataTypes.STRING,
        allowNull: true,        // can be NULL if status is removed
        references: {
          model: 'Statuses',     // table name
          key: 'statusName',     // column being referenced in Status
        },
        onUpdate: 'CASCADE',     // update this if statusName changes
        onDelete: 'SET NULL',    // remove association if Status deleted
      },

      // Timestamp when the status was created
      statusCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Determine shift of the logged-in user
      shiftName: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'Shifts',    // table name
          key: 'shiftName',   // column being referenced in Shifts
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // Indicates approval state (e.g. "Pending", "Approved", "Rejected")
      approvalStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // Timestamp when the request was approved
      ApprovalTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // The user (or manager) who approved this request
      approvedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // End time or completion timestamp for the request
      statusEnd: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // Duration value (in minutes/hours) associated with the request
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // Reason for the request, e.g., "System maintenance", "Break"
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Request',
      tableName: 'Requests',
      freezeTableName: true,  // prevents Sequelize from pluralizing the table name
      timestamps: true,       // adds createdAt and updatedAt fields automatically
    }
  );

  return Request;
};
