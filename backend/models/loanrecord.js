"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class LoanRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LoanRecord.belongsTo(models.FarmerAccount, {
        foreignKey: "farmerAccountID",
      });
      LoanRecord.belongsTo(models.User, {
        foreignKey: "approvedBy",
        as: "approvedByUser",
      });
    }
  }
  LoanRecord.init(
    {
      loanRecordID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerAccountID: DataTypes.INTEGER,
      loanAmount: DataTypes.DECIMAL,
      purpose: DataTypes.STRING,
      releaseDate: DataTypes.DATE,
      dueDate: DataTypes.DATE,
      amountRepaid: DataTypes.DECIMAL,
      outstandingBalance: DataTypes.DECIMAL,
      status: DataTypes.STRING,
      approvedBy: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "LoanRecord",
    },
  );
  return LoanRecord;
};
