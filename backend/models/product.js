"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Farmer, { foreignKey: "farmerID" });
      Product.belongsTo(models.CropType, { foreignKey: "cropTypeID" });
    }
  }
  Product.init(
    {
      productID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmerID: DataTypes.INTEGER,
      cropTypeID: DataTypes.INTEGER,
      unitPrice: DataTypes.DECIMAL,
      availableQuantity: DataTypes.INTEGER,
      qualityGrade: DataTypes.STRING,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Product",
    },
  );
  return Product;
};
