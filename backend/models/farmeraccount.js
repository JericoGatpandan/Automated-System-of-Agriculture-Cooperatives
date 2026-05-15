"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FarmerAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FarmerAccount.belongsTo(models.Farmer, { foreignKey: "farmerID" });
      FarmerAccount.belongsTo(models.PrimaryCooperative, {
        foreignKey: "primaryCoopID",
      });
      FarmerAccount.hasMany(models.SalesRecord, {
        foreignKey: "farmerAccountID",
      });
      FarmerAccount.hasMany(models.LoanRecord, {
        foreignKey: "farmerAccountID",
      });
      FarmerAccount.hasMany(models.PrintedStatement, {
        foreignKey: "farmerAccountID",
      });
      FarmerAccount.hasMany(models.FeeRecord, {
        foreignKey: "farmerAccountID",
      });
    }
  }
  FarmerAccount.init(
    {
      farmerAccountID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerID: DataTypes.INTEGER,
      primaryCoopID: DataTypes.INTEGER,
      createdDate: DataTypes.DATE,
      status: DataTypes.STRING,
      totalShareCapital: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "FarmerAccount",
      timestamps: false,
    },
  );
  return FarmerAccount;
};
