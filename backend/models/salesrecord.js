"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SalesRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SalesRecord.belongsTo(models.FarmerAccount, {
        foreignKey: "farmerAccountID",
      });
      SalesRecord.belongsTo(models.DeliveryRecord, {
        foreignKey: "deliveryID",
      });
      SalesRecord.hasMany(models.FeeRecord, { foreignKey: "salesRecordID" });
    }
  }
  SalesRecord.init(
    {
      salesRecordID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerAccountID: DataTypes.INTEGER,
      deliveryID: DataTypes.INTEGER,
      grossAmount: DataTypes.DECIMAL,
      commissionAmount: DataTypes.DECIMAL,
      netAmount: DataTypes.DECIMAL,
      transactionDate: DataTypes.DATE,
      remarks: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "SalesRecord",
    },
  );
  return SalesRecord;
};
