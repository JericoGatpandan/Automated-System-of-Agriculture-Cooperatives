'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_farmer_fulfillment_insert;`);

    // Trigger: Farmer Fulfillment -> Farmer Notification
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_farmer_fulfillment_insert
      AFTER INSERT ON FarmerFulfillments
      FOR EACH ROW
      BEGIN
        INSERT INTO Notifications (recipientRole, recipientID, type, message, referenceId, isRead, createdAt, updatedAt)
        VALUES ('Farmer', NEW.farmerID, 'farmer_fulfillment', 'You have been assigned to fulfill a buyer order.', NEW.fulfillmentID, false, NOW(), NOW());
      END;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_farmer_fulfillment_insert;`);
  }
};
