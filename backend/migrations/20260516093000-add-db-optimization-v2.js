"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addIndex(
        "FarmerAccounts",
        ["farmerID", "primaryCoopID"],
        { name: "idx_farmer_accounts_farmer_coop", transaction },
      );
      await queryInterface.addIndex(
        "FarmerCooperatives",
        ["primaryCoopID", "status"],
        { name: "idx_farmer_coops_primary_status", transaction },
      );
      await queryInterface.addIndex(
        "CoopAssignments",
        ["orderID", "primaryCoopID"],
        { name: "idx_coop_assignments_order", transaction },
      );
      await queryInterface.addIndex(
        "FarmerFulfillments",
        ["assignmentID", "status"],
        { name: "idx_fulfillments_assignment_status", transaction },
      );
      await queryInterface.addIndex("DeliveryRecords", ["orderID", "status"], {
        name: "idx_delivery_order_status",
        transaction,
      });
      await queryInterface.addIndex("SalesRecords", ["deliveryID"], {
        name: "idx_sales_delivery",
        transaction,
      });
      await queryInterface.addIndex(
        "FeeRecords",
        ["farmerAccountID", "feeType"],
        { name: "idx_fee_account_type", transaction },
      );
      await queryInterface.addIndex(
        "LoanRecords",
        ["farmerAccountID", "status", "dueDate"],
        { name: "idx_loan_account_status_due", transaction },
      );

      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_complete_delivery_v2;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_generate_statement;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_refresh_loan_statuses;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_get_account_ledger_summary;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_build_coop_ledger_summary;",
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE PROCEDURE sp_refresh_loan_statuses (IN p_farmer_account_id INT)
        BEGIN
          UPDATE LoanRecords
          SET
            outstandingBalance = loanAmount - amountRepaid,
            status = CASE
              WHEN (loanAmount - amountRepaid) <= 0.001 THEN 'paid'
              WHEN dueDate < CURDATE() AND (loanAmount - amountRepaid) > 0 THEN 'overdue'
              WHEN amountRepaid > 0 AND (loanAmount - amountRepaid) > 0 THEN 'partial'
              ELSE 'active'
            END
          WHERE farmerAccountID = p_farmer_account_id;
        END;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE PROCEDURE sp_complete_delivery_v2 (IN p_delivery_id INT)
        BEGIN
          DECLARE v_total_amount DECIMAL(12,2);
          DECLARE v_fed_rate DECIMAL(12,6);
          DECLARE v_coop_rate DECIMAL(12,6);
          DECLARE v_order_id INT;
          DECLARE v_delivery_date DATE;
          DECLARE v_total_qty DECIMAL(12,4);
          DECLARE v_status VARCHAR(32);

          DECLARE EXIT HANDLER FOR SQLEXCEPTION
          BEGIN
            ROLLBACK;
            RESIGNAL;
          END;

          START TRANSACTION;

          SELECT totalTransactionAmount,
                 commissionRateFederation,
                 commissionRateCoop,
                 orderID,
                 deliveryDate,
                 status
            INTO v_total_amount,
                 v_fed_rate,
                 v_coop_rate,
                 v_order_id,
                 v_delivery_date,
                 v_status
          FROM DeliveryRecords
          WHERE deliveryID = p_delivery_id
          FOR UPDATE;

          IF v_order_id IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Delivery not found';
          END IF;

          IF v_status <> 'pending' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Delivery is not in pending status';
          END IF;

          SET v_delivery_date = COALESCE(v_delivery_date, CURDATE());

          SELECT COALESCE(SUM(ff.quantityCommitted), 0)
            INTO v_total_qty
          FROM FarmerFulfillments ff
          JOIN CoopAssignments ca ON ff.assignmentID = ca.assignmentID
          WHERE ca.orderID = v_order_id
            AND ff.status IN ('confirmed', 'ready');

          INSERT INTO FarmerAccounts (farmerID, primaryCoopID, createdDate, status, updatedAt)
          SELECT DISTINCT ff.farmerID, ca.primaryCoopID, NOW(), 'active', NOW()
          FROM FarmerFulfillments ff
          JOIN CoopAssignments ca ON ff.assignmentID = ca.assignmentID
          WHERE ca.orderID = v_order_id
            AND ff.status IN ('confirmed', 'ready')
            AND NOT EXISTS (
              SELECT 1 FROM FarmerAccounts fa
              WHERE fa.farmerID = ff.farmerID
                AND fa.primaryCoopID = ca.primaryCoopID
            );

          IF v_total_qty > 0 THEN
            INSERT INTO SalesRecords (
              farmerAccountID,
              deliveryID,
              grossAmount,
              commissionAmount,
              netAmount,
              transactionDate,
              remarks,
              createdAt,
              updatedAt
            )
            SELECT
              fa.farmerAccountID,
              p_delivery_id,
              ROUND((ff.quantityCommitted / v_total_qty) * v_total_amount, 2) AS grossAmount,
              ROUND((ff.quantityCommitted / v_total_qty) * v_total_amount * (v_fed_rate + v_coop_rate), 2) AS commissionAmount,
              ROUND((ff.quantityCommitted / v_total_qty) * v_total_amount * (1 - (v_fed_rate + v_coop_rate)), 2) AS netAmount,
              v_delivery_date,
              CONCAT('Auto-generated from delivery DEL-', p_delivery_id),
              NOW(),
              NOW()
            FROM FarmerFulfillments ff
            JOIN CoopAssignments ca ON ff.assignmentID = ca.assignmentID
            JOIN FarmerAccounts fa ON fa.farmerID = ff.farmerID AND fa.primaryCoopID = ca.primaryCoopID
            WHERE ca.orderID = v_order_id
              AND ff.status IN ('confirmed', 'ready');

            INSERT INTO FeeRecords (
              farmerAccountID,
              salesRecordID,
              feeType,
              rate,
              amount,
              status,
              createdAt,
              updatedAt
            )
            SELECT
              sr.farmerAccountID,
              sr.salesRecordID,
              'federationFee',
              v_fed_rate,
              ROUND(sr.grossAmount * v_fed_rate, 2),
              'recorded',
              NOW(),
              NOW()
            FROM SalesRecords sr
            WHERE sr.deliveryID = p_delivery_id;

            INSERT INTO FeeRecords (
              farmerAccountID,
              salesRecordID,
              feeType,
              rate,
              amount,
              status,
              createdAt,
              updatedAt
            )
            SELECT
              sr.farmerAccountID,
              sr.salesRecordID,
              'coopFee',
              v_coop_rate,
              ROUND(sr.grossAmount * v_coop_rate, 2),
              'recorded',
              NOW(),
              NOW()
            FROM SalesRecords sr
            WHERE sr.deliveryID = p_delivery_id;

            INSERT INTO FeeRecords (
              farmerAccountID,
              salesRecordID,
              feeType,
              rate,
              amount,
              status,
              createdAt,
              updatedAt
            )
            SELECT
              sr.farmerAccountID,
              sr.salesRecordID,
              'capitalContribution',
              0,
              0,
              'recorded',
              NOW(),
              NOW()
            FROM SalesRecords sr
            WHERE sr.deliveryID = p_delivery_id;

            INSERT INTO FeeRecords (
              farmerAccountID,
              salesRecordID,
              feeType,
              rate,
              amount,
              status,
              createdAt,
              updatedAt
            )
            SELECT
              sr.farmerAccountID,
              sr.salesRecordID,
              'capitalRetention',
              0,
              0,
              'recorded',
              NOW(),
              NOW()
            FROM SalesRecords sr
            WHERE sr.deliveryID = p_delivery_id;
          END IF;

          UPDATE DeliveryRecords
          SET status = 'delivered', deliveryDate = v_delivery_date, updatedAt = NOW()
          WHERE deliveryID = p_delivery_id;

          IF NOT EXISTS (
            SELECT 1 FROM DeliveryRecords
            WHERE orderID = v_order_id AND status <> 'delivered'
          ) THEN
            UPDATE BuyerOrders
            SET status = 'completed', updatedAt = NOW()
            WHERE orderID = v_order_id;
          END IF;

          COMMIT;
        END;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE PROCEDURE sp_get_account_ledger_summary (
          IN p_farmer_account_id INT,
          IN p_start DATE,
          IN p_end DATE
        )
        BEGIN
          SELECT
            p_farmer_account_id AS farmerAccountID,
            (
              SELECT COALESCE(SUM(sr.grossAmount), 0)
              FROM SalesRecords sr
              WHERE sr.farmerAccountID = p_farmer_account_id
                AND (
                  p_start IS NULL OR p_end IS NULL OR
                  (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY))
                )
            ) AS totalGrossSales,
            (
              SELECT COALESCE(SUM(sr.commissionAmount), 0)
              FROM SalesRecords sr
              WHERE sr.farmerAccountID = p_farmer_account_id
                AND (
                  p_start IS NULL OR p_end IS NULL OR
                  (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY))
                )
            ) AS totalCommission,
            (
              SELECT COALESCE(SUM(sr.netAmount), 0)
              FROM SalesRecords sr
              WHERE sr.farmerAccountID = p_farmer_account_id
                AND (
                  p_start IS NULL OR p_end IS NULL OR
                  (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY))
                )
            ) AS netBalance,
            (
              SELECT COALESCE(SUM(fr.amount), 0)
              FROM FeeRecords fr
              JOIN SalesRecords sr ON fr.salesRecordID = sr.salesRecordID
              WHERE fr.farmerAccountID = p_farmer_account_id
                AND fr.feeType IN ('capitalContribution', 'capitalRetention')
                AND (
                  p_start IS NULL OR p_end IS NULL OR
                  (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY))
                )
            ) AS totalShareCapital,
            (
              SELECT COALESCE(SUM(lr.outstandingBalance), 0)
              FROM LoanRecords lr
              WHERE lr.farmerAccountID = p_farmer_account_id
                AND lr.outstandingBalance > 0
            ) AS outstandingLoans;
        END;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE PROCEDURE sp_build_coop_ledger_summary (
          IN p_primary_coop_id INT,
          IN p_start DATE,
          IN p_end DATE
        )
        BEGIN
          SELECT
            fa.farmerAccountID,
            fa.status AS accountStatus,
            f.farmerID,
            CONCAT(
              f.firstName,
              ' ',
              IFNULL(f.middleName, ''),
              CASE WHEN f.middleName IS NULL OR f.middleName = '' THEN '' ELSE ' ' END,
              f.lastName,
              IFNULL(CONCAT(' ', f.suffixName), '')
            ) AS farmerName,
            COALESCE(sa.totalGrossSales, 0) AS totalGrossSales,
            COALESCE(sa.totalCommission, 0) AS totalCommission,
            COALESCE(sa.netBalance, 0) AS netBalance,
            COALESCE(sc.totalShareCapital, 0) AS totalShareCapital,
            COALESCE(lo.outstandingLoans, 0) AS outstandingLoans
          FROM FarmerAccounts fa
          JOIN Farmers f ON fa.farmerID = f.farmerID
          LEFT JOIN (
            SELECT
              sr.farmerAccountID,
              SUM(sr.grossAmount) AS totalGrossSales,
              SUM(sr.commissionAmount) AS totalCommission,
              SUM(sr.netAmount) AS netBalance
            FROM SalesRecords sr
            WHERE (
              p_start IS NULL OR p_end IS NULL OR
              (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY))
            )
            GROUP BY sr.farmerAccountID
          ) sa ON sa.farmerAccountID = fa.farmerAccountID
          LEFT JOIN (
            SELECT
              fr.farmerAccountID,
              SUM(fr.amount) AS totalShareCapital
            FROM FeeRecords fr
            JOIN SalesRecords sr ON fr.salesRecordID = sr.salesRecordID
            WHERE fr.feeType IN ('capitalContribution', 'capitalRetention')
              AND (
                p_start IS NULL OR p_end IS NULL OR
                (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY))
              )
            GROUP BY fr.farmerAccountID
          ) sc ON sc.farmerAccountID = fa.farmerAccountID
          LEFT JOIN (
            SELECT farmerAccountID, SUM(outstandingBalance) AS outstandingLoans
            FROM LoanRecords
            WHERE outstandingBalance > 0
            GROUP BY farmerAccountID
          ) lo ON lo.farmerAccountID = fa.farmerAccountID
          WHERE fa.primaryCoopID = p_primary_coop_id
            AND f.isDeleted = 0
          ORDER BY farmerName ASC;
        END;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        `
        CREATE PROCEDURE sp_generate_statement (
          IN p_farmer_account_id INT,
          IN p_start DATE,
          IN p_end DATE
        )
        BEGIN
          DECLARE v_gross DECIMAL(12,2);
          DECLARE v_commission DECIMAL(12,2);
          DECLARE v_net DECIMAL(12,2);
          DECLARE v_share DECIMAL(12,2);
          DECLARE v_loans DECIMAL(12,2);

          IF @generated_by IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'generatedBy is required';
          END IF;

          CALL sp_refresh_loan_statuses(p_farmer_account_id);

          SELECT COALESCE(SUM(sr.grossAmount), 0),
                 COALESCE(SUM(sr.commissionAmount), 0),
                 COALESCE(SUM(sr.netAmount), 0)
            INTO v_gross, v_commission, v_net
          FROM SalesRecords sr
          WHERE sr.farmerAccountID = p_farmer_account_id
            AND (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY));

          SELECT COALESCE(SUM(fr.amount), 0)
            INTO v_share
          FROM FeeRecords fr
          JOIN SalesRecords sr ON fr.salesRecordID = sr.salesRecordID
          WHERE fr.farmerAccountID = p_farmer_account_id
            AND fr.feeType IN ('capitalContribution', 'capitalRetention')
            AND (sr.transactionDate >= p_start AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY));

          SELECT COALESCE(SUM(lr.outstandingBalance), 0)
            INTO v_loans
          FROM LoanRecords lr
          WHERE lr.farmerAccountID = p_farmer_account_id
            AND lr.outstandingBalance > 0;

          INSERT INTO PrintedStatements (
            farmerAccountID,
            periodStart,
            periodEnd,
            generatedBy,
            generatedDate,
            totalGrossSales,
            totalCommission,
            totalShareCapital,
            totalLoans,
            netBalance,
            createdAt,
            updatedAt
          )
          VALUES (
            p_farmer_account_id,
            p_start,
            p_end,
            @generated_by,
            NOW(),
            v_gross,
            v_commission,
            v_share,
            v_loans,
            v_net,
            NOW(),
            NOW()
          );

          SELECT * FROM PrintedStatements WHERE printedStatementID = LAST_INSERT_ID();
        END;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        "DROP EVENT IF EXISTS ev_monthly_soft_delete_purge;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        `
        CREATE EVENT ev_monthly_soft_delete_purge
        ON SCHEDULE EVERY 1 MONTH
        DO
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = DATABASE()
              AND table_name = 'AuditLogs'
          ) THEN
            DELETE FROM AuditLogs
            WHERE createdAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
          END IF;
        END;
        `,
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        "DROP EVENT IF EXISTS ev_monthly_soft_delete_purge;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        `
        CREATE EVENT ev_monthly_soft_delete_purge
        ON SCHEDULE EVERY 1 MONTH
        DO
        BEGIN
          DELETE FROM Farmers
          WHERE isDeleted = 1 AND updatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
          DELETE FROM BuyerOrders
          WHERE status = 'cancelled' AND updatedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);
        END;
        `,
        { transaction },
      );

      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_complete_delivery_v2;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_generate_statement;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_refresh_loan_statuses;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_get_account_ledger_summary;",
        { transaction },
      );
      await queryInterface.sequelize.query(
        "DROP PROCEDURE IF EXISTS sp_build_coop_ledger_summary;",
        { transaction },
      );

      await queryInterface.removeIndex(
        "LoanRecords",
        "idx_loan_account_status_due",
        { transaction },
      );
      await queryInterface.removeIndex("FeeRecords", "idx_fee_account_type", {
        transaction,
      });
      await queryInterface.removeIndex("SalesRecords", "idx_sales_delivery", {
        transaction,
      });
      await queryInterface.removeIndex(
        "DeliveryRecords",
        "idx_delivery_order_status",
        { transaction },
      );
      await queryInterface.removeIndex(
        "FarmerFulfillments",
        "idx_fulfillments_assignment_status",
        { transaction },
      );
      await queryInterface.removeIndex(
        "CoopAssignments",
        "idx_coop_assignments_order",
        { transaction },
      );
      await queryInterface.removeIndex(
        "FarmerCooperatives",
        "idx_farmer_coops_primary_status",
        { transaction },
      );
      await queryInterface.removeIndex(
        "FarmerAccounts",
        "idx_farmer_accounts_farmer_coop",
        { transaction },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
