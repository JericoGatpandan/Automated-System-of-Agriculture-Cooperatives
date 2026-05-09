"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FarmerFulfillment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FarmerFulfillment.belongsTo(models.CoopAssignment, {
        foreignKey: "assignmentID",
      });
      FarmerFulfillment.belongsTo(models.Farmer, { foreignKey: "farmerID" });
      FarmerFulfillment.belongsTo(models.User, {
        foreignKey: "assignedBy",
        as: "assignedByUser",
      });
    }
  }
  FarmerFulfillment.init(
    {
      fulfillmentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      assignmentID: DataTypes.INTEGER,
      farmerID: DataTypes.INTEGER,
      assignedBy: DataTypes.INTEGER,
      quantityCommitted: DataTypes.INTEGER,
      status: DataTypes.STRING,
      notes: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "FarmerFulfillment",
    },
  );
  return FarmerFulfillment;
};
