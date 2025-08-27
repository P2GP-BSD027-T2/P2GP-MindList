"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Task.belongsTo(models.Board, { foreignKey: "BoardId" });
      Task.belongsTo(models.User, { foreignKey: "UserId", as: "AssignedUser" });
      Task.hasMany(models.Attachment, { foreignKey: "TaskId" });
    }
  }
  Task.init(
    {
      BoardId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      status: { type: DataTypes.STRING, defaultValue: "todo" },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Task",
    }
  );
  return Task;
};
