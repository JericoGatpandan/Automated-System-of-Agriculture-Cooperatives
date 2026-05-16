'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_partnership_request_insert;`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_delivery_update_to_delivered;`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_coop_assignment_insert;`);

    // Trigger 1: Partnership Requests -> Admin Notification
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_partnership_request_insert
      AFTER INSERT ON PartnershipRequests
      FOR EACH ROW
      BEGIN
        INSERT INTO Notifications (recipientRole, type, message, referenceId, isRead, createdAt, updatedAt)
        VALUES ('Admin', 'partnership_request', CONCAT('New partnership inquiry from ', NEW.coopName), NEW.id, false, NOW(), NOW());
      END;
    `);

    // Trigger 2: Delivery Confirmations -> Admin Notification
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_delivery_update_to_delivered
      AFTER UPDATE ON DeliveryRecords
      FOR EACH ROW
      BEGIN
        IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
          INSERT INTO Notifications (recipientRole, type, message, referenceId, isRead, createdAt, updatedAt)
          VALUES ('Admin', 'delivery_confirmation', CONCAT('Delivery #', NEW.deliveryID, ' is pending confirmation.'), NEW.deliveryID, false, NOW(), NOW());
        END IF;
      END;
    `);

    // Trigger 3: Coop Assignments -> Officer Notification
    await queryInterface.sequelize.query(`
      CREATE TRIGGER after_coop_assignment_insert
      AFTER INSERT ON CoopAssignments
      FOR EACH ROW
      BEGIN
        INSERT INTO Notifications (recipientRole, recipientID, type, message, referenceId, isRead, createdAt, updatedAt)
        VALUES ('Officer', NEW.primaryCoopID, 'coop_assignment', 'A new buyer order has been assigned to your cooperative.', NEW.assignmentID, false, NOW(), NOW());
      END;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_partnership_request_insert;`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_delivery_update_to_delivered;`);
    await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS after_coop_assignment_insert;`);
  }
};
