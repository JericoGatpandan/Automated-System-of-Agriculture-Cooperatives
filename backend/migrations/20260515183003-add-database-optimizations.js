"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Add totalShareCapital column to FarmerAccounts
      await queryInterface.addColumn(
        "FarmerAccounts",
        "totalShareCapital",
        {
          type: Sequelize.DECIMAL(12, 2),
          defaultValue: 0.00,
        },
        { transaction }
      );

      // 2. Indexes
      await queryInterface.addIndex("Users", ["email"], { name: "idx_user_email", transaction });
      await queryInterface.addIndex("Farmers", ["lastName", "firstName"], { name: "idx_farmer_name", transaction });
      await queryInterface.addIndex("BuyerOrders", ["status", "orderDate"], { name: "idx_buyer_order_status_date", transaction });
      await queryInterface.addIndex("SalesRecords", ["farmerAccountID", "transactionDate"], { name: "idx_sales_farmer_date", transaction });

      // 3. View: vw_farmer_ledger_summary
      await queryInterface.sequelize.query(`
        CREATE OR REPLACE VIEW vw_farmer_ledger_summary AS
        SELECT 
          fa.farmerAccountID,
          fa.farmerID,
          f.firstName,
          f.lastName,
          pc.coopName,
          fa.totalShareCapital,
          (SELECT COALESCE(SUM(sr.grossAmount), 0) FROM SalesRecords sr WHERE sr.farmerAccountID = fa.farmerAccountID) AS totalGrossSales,
          (SELECT COALESCE(SUM(fr.amount), 0) FROM FeeRecords fr WHERE fr.farmerAccountID = fa.farmerAccountID AND fr.feeType IN ('coopFee', 'federationFee')) AS totalCommissions,
          (SELECT COALESCE(SUM(lr.outstandingBalance), 0) FROM LoanRecords lr WHERE lr.farmerAccountID = fa.farmerAccountID AND lr.status IN ('active', 'partial', 'overdue')) AS totalOutstandingLoans
        FROM FarmerAccounts fa
        JOIN Farmers f ON fa.farmerID = f.farmerID
        JOIN PrimaryCooperatives pc ON fa.primaryCoopID = pc.primaryCoopID;
      `, { transaction });

      // 4. Triggers
      
      // Trigger: tr_after_fee_insert
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS tr_after_fee_insert;`, { transaction });
      await queryInterface.sequelize.query(`
        CREATE TRIGGER tr_after_fee_insert
        AFTER INSERT ON FeeRecords
        FOR EACH ROW
        BEGIN
          IF NEW.feeType IN ('capitalContribution', 'capitalRetention') THEN
            UPDATE FarmerAccounts 
            SET totalShareCapital = totalShareCapital + NEW.amount 
            WHERE farmerAccountID = NEW.farmerAccountID;
          END IF;
        END;
      `, { transaction });

      // Trigger: tr_before_loan_update
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS tr_before_loan_update;`, { transaction });
      await queryInterface.sequelize.query(`
        CREATE TRIGGER tr_before_loan_update
        BEFORE UPDATE ON LoanRecords
        FOR EACH ROW
        BEGIN
          SET NEW.outstandingBalance = NEW.loanAmount - NEW.amountRepaid;
          IF NEW.outstandingBalance <= 0 THEN
            SET NEW.status = 'paid';
          END IF;
        END;
      `, { transaction });

      // 5. Stored Procedure: sp_complete_delivery
      await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_complete_delivery;`, { transaction });
      await queryInterface.sequelize.query(`
        CREATE PROCEDURE sp_complete_delivery (IN p_deliveryID INT)
        BEGIN
          DECLARE v_totalAmount DECIMAL(12,2);
          DECLARE v_fedRate DECIMAL(5,2);
          DECLARE v_coopRate DECIMAL(5,2);
          DECLARE v_totalDelivered INT;
          
          -- Error handling
          DECLARE EXIT HANDLER FOR SQLEXCEPTION 
          BEGIN
            ROLLBACK;
            RESIGNAL;
          END;

          START TRANSACTION;

          -- Fetch Delivery details
          SELECT totalTransactionAmount, commissionRateFederation, commissionRateCoop
          INTO v_totalAmount, v_fedRate, v_coopRate
          FROM DeliveryRecords WHERE deliveryID = p_deliveryID;

          -- Calculate total quantity committed across all fulfillments for this order
          SELECT COALESCE(SUM(ff.quantityCommitted), 1) INTO v_totalDelivered
          FROM FarmerFulfillments ff
          JOIN CoopAssignments ca ON ff.assignmentID = ca.assignmentID
          JOIN DeliveryRecords dr ON ca.orderID = dr.orderID
          WHERE dr.deliveryID = p_deliveryID AND ff.status = 'delivered';

          -- Loop through farmers and insert Sales/Fee records
          -- (Using INSERT ... SELECT to avoid explicit cursor loops for simplicity)
          
          INSERT INTO SalesRecords (farmerAccountID, deliveryID, grossAmount, commissionAmount, netAmount, transactionDate, remarks, createdAt, updatedAt)
          SELECT 
            fa.farmerAccountID, 
            p_deliveryID,
            (ff.quantityCommitted / v_totalDelivered) * v_totalAmount AS grossAmount,
            ((ff.quantityCommitted / v_totalDelivered) * v_totalAmount) * ((v_fedRate + v_coopRate) / 100) AS commissionAmount,
            ((ff.quantityCommitted / v_totalDelivered) * v_totalAmount) * (1 - ((v_fedRate + v_coopRate) / 100)) AS netAmount,
            CURDATE(),
            'Auto-generated from Delivery',
            NOW(),
            NOW()
          FROM FarmerFulfillments ff
          JOIN CoopAssignments ca ON ff.assignmentID = ca.assignmentID
          JOIN DeliveryRecords dr ON ca.orderID = dr.orderID
          JOIN FarmerAccounts fa ON fa.farmerID = ff.farmerID AND fa.primaryCoopID = ca.primaryCoopID
          WHERE dr.deliveryID = p_deliveryID AND ff.status = 'delivered';

          -- Note: FeeRecord generation could be done here as well via similar INSERT SELECT
          
          UPDATE DeliveryRecords SET status = 'delivered' WHERE deliveryID = p_deliveryID;

          COMMIT;
        END;
      `, { transaction });

      // 6. Events
      
      // Event: ev_daily_overdue_loans
      await queryInterface.sequelize.query(`DROP EVENT IF EXISTS ev_daily_overdue_loans;`, { transaction });
      await queryInterface.sequelize.query(`
        CREATE EVENT ev_daily_overdue_loans
        ON SCHEDULE EVERY 1 DAY STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY)
        DO
        BEGIN
          UPDATE LoanRecords 
          SET status = 'overdue' 
          WHERE dueDate < CURDATE() AND outstandingBalance > 0 AND status != 'overdue';
        END;
      `, { transaction });

      // Event: ev_monthly_soft_delete_purge
      await queryInterface.sequelize.query(`DROP EVENT IF EXISTS ev_monthly_soft_delete_purge;`, { transaction });
      await queryInterface.sequelize.query(`
        CREATE EVENT ev_monthly_soft_delete_purge
        ON SCHEDULE EVERY 1 MONTH
        DO
        BEGIN
          -- Example: Purge Farmers deleted more than 30 days ago
          DELETE FROM Farmers WHERE isDeleted = 1 AND updatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
          DELETE FROM BuyerOrders WHERE status = 'cancelled' AND updatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
        END;
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(`DROP EVENT IF EXISTS ev_monthly_soft_delete_purge;`, { transaction });
      await queryInterface.sequelize.query(`DROP EVENT IF EXISTS ev_daily_overdue_loans;`, { transaction });
      await queryInterface.sequelize.query(`DROP PROCEDURE IF EXISTS sp_complete_delivery;`, { transaction });
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS tr_before_loan_update;`, { transaction });
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS tr_after_fee_insert;`, { transaction });
      await queryInterface.sequelize.query(`DROP VIEW IF EXISTS vw_farmer_ledger_summary;`, { transaction });
      
      await queryInterface.removeIndex("SalesRecords", "idx_sales_farmer_date", { transaction });
      await queryInterface.removeIndex("BuyerOrders", "idx_buyer_order_status_date", { transaction });
      await queryInterface.removeIndex("Farmers", "idx_farmer_name", { transaction });
      await queryInterface.removeIndex("Users", "idx_user_email", { transaction });

      await queryInterface.removeColumn("FarmerAccounts", "totalShareCapital", { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
