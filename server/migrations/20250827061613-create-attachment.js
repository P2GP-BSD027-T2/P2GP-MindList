"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Attachments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      BoardId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Boards",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      TaskId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Tasks",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      type: {
        type: Sequelize.STRING,
      },
      url: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Attachments");
  },
};
