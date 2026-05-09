"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CoopAssignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CoopAssignment.belongsTo(models.BuyerOrder, { foreignKey: "orderID" });
      CoopAssignment.belongsTo(models.PrimaryCooperative, {
        foreignKey: "primaryCoopID",
      });
      CoopAssignment.belongsTo(models.User, {
        foreignKey: "assignedBy",
        as: "assignedByUser",
      });
      CoopAssignment.hasMany(models.FarmerFulfillment, {
        foreignKey: "assignmentID",
      });
    }
  }
  CoopAssignment.init(
    {
      assignmentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderID: DataTypes.INTEGER,
      primaryCoopID: DataTypes.INTEGER,
      assignedBy: DataTypes.INTEGER,
      assignedDate: DataTypes.DATE,
      quantityRequired: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "CoopAssignment",
    },
  );
  return CoopAssignment;
};
