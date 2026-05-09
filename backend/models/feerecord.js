"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FeeRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FeeRecord.belongsTo(models.FarmerAccount, {
        foreignKey: "farmerAccountID",
      });
      FeeRecord.belongsTo(models.SalesRecord, { foreignKey: "salesRecordID" });
    }
  }
  FeeRecord.init(
    {
      feeRecordID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerAccountID: DataTypes.INTEGER,
      salesRecordID: DataTypes.INTEGER,
      feeType: DataTypes.STRING,
      rate: DataTypes.DECIMAL,
      amount: DataTypes.DECIMAL,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FeeRecord",
    },
  );
  return FeeRecord;
};
