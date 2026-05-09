"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FarmerCooperative extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FarmerCooperative.belongsTo(models.Farmer, { foreignKey: "farmerID" });
      FarmerCooperative.belongsTo(models.PrimaryCooperative, {
        foreignKey: "primaryCoopID",
      });
    }
  }
  FarmerCooperative.init(
    {
      farmerCoopID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerID: DataTypes.INTEGER,
      primaryCoopID: DataTypes.INTEGER,
      joinedDate: DataTypes.DATE,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FarmerCooperative",
    },
  );
  return FarmerCooperative;
};
