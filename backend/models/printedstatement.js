"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PrintedStatement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PrintedStatement.belongsTo(models.FarmerAccount, {
        foreignKey: "farmerAccountID",
      });
      PrintedStatement.belongsTo(models.User, {
        foreignKey: "generatedBy",
        as: "generatedByUser",
      });
    }
  }
  PrintedStatement.init(
    {
      printedStatementID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerAccountID: DataTypes.INTEGER,
      periodStart: DataTypes.DATE,
      periodEnd: DataTypes.DATE,
      generatedBy: DataTypes.INTEGER,
      generatedDate: DataTypes.DATE,
      totalGrossSales: DataTypes.DECIMAL,
      totalCommission: DataTypes.DECIMAL,
      totalShareCapital: DataTypes.DECIMAL,
      totalLoans: DataTypes.DECIMAL,
      netBalance: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "PrintedStatement",
    },
  );
  return PrintedStatement;
};
