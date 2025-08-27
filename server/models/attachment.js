"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attachment.belongsTo(models.Task, { foreignKey: "TaskId" });
      Attachment.belongsTo(models.Board, { foreignKey: "BoardId" });
    }
  }
  Attachment.init(
    {
      BoardId: DataTypes.INTEGER,
      TaskId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      mime: DataTypes.STRING,
      url: DataTypes.STRING,
      providerPublicId: DataTypes.STRING,
      size: DataTypes.INTEGER,
      width: DataTypes.INTEGER,
      height: DataTypes.INTEGER,
      pages: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Attachment",
    }
  );
  return Attachment;
};
