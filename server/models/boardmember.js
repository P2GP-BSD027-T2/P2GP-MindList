"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BoardMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BoardMember.init(
    {
      BoardId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
      role: { type: DataTypes.STRING, defaultValue: "member" },
      joinedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: "BoardMember",
    }
  );
  BoardMember.beforeCreate(async (member, options) => {
    const existingMembers = await BoardMember.findAll({
      where: {
        BoardId: member.BoardId,
      },
    });
    if (existingMembers.length === 0) {
      member.role = "owner";
    }
  });
  return BoardMember;
};
