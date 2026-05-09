"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "roleID" });
      User.hasOne(models.PrimaryCooperative, { foreignKey: "userID" });
      User.hasOne(models.Farmer, { foreignKey: "userID" });
      User.hasMany(models.BuyerOrder, {
        foreignKey: "managedBy",
        as: "managedOrders",
      });
      User.hasMany(models.CoopAssignment, {
        foreignKey: "assignedBy",
        as: "assignmentsCreated",
      });
      User.hasMany(models.FarmerFulfillment, {
        foreignKey: "assignedBy",
        as: "fulfillmentsAssigned",
      });
      User.hasMany(models.DeliveryRecord, {
        foreignKey: "managedBy",
        as: "managedDeliveries",
      });
      User.hasMany(models.LoanRecord, {
        foreignKey: "approvedBy",
        as: "approvedLoans",
      });
      User.hasMany(models.PrintedStatement, {
        foreignKey: "generatedBy",
        as: "generatedStatements",
      });
    }
  }
  User.init(
    {
      userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleID: DataTypes.INTEGER,
      email: DataTypes.STRING,
      password_hash: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
