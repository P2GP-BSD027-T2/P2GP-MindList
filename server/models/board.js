"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Board extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Board.hasMany(models.Task, { foreignKey: "BoardId" });
      Board.hasMany(models.Attachment, { foreignKey: "BoardId" });
      Board.belongsTo(models.User, { foreignKey: "UserId" }); // owner
      Board.belongsToMany(models.User, {
        through: models.BoardMember,
        foreignKey: "BoardId",
        otherKey: "UserId",
        as: "Members",
      });
    }
  }
  Board.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Board name is required" },
          notEmpty: { msg: "Board name is required" },
        },
      },
      code: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Board",
    }
  );
  return Board;
};
