
-- sp_generate_statement
CREATE DEFINER = `root` @`localhost` PROCEDURE `asac_db`.`sp_generate_statement`(
    IN p_farmer_account_id INT,
    IN p_start DATE,
    IN p_end DATE
) BEGIN
DECLARE v_gross DECIMAL(12, 2);
DECLARE v_commission DECIMAL(12, 2);
DECLARE v_net DECIMAL(12, 2);
DECLARE v_share DECIMAL(12, 2);
DECLARE v_loans DECIMAL(12, 2);
IF @generated_by IS NULL THEN SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'generatedBy is required';
END IF;
CALL sp_refresh_loan_statuses(p_farmer_account_id);
SELECT COALESCE(SUM(sr.grossAmount), 0),
    COALESCE(SUM(sr.commissionAmount), 0),
    COALESCE(SUM(sr.netAmount), 0) INTO v_gross,
    v_commission,
    v_net
FROM SalesRecords sr
WHERE sr.farmerAccountID = p_farmer_account_id
    AND (
        sr.transactionDate >= p_start
        AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY)
    );
SELECT COALESCE(SUM(fr.amount), 0) INTO v_share
FROM FeeRecords fr
    JOIN SalesRecords sr ON fr.salesRecordID = sr.salesRecordID
WHERE fr.farmerAccountID = p_farmer_account_id
    AND fr.feeType IN ('capitalContribution', 'capitalRetention')
    AND (
        sr.transactionDate >= p_start
        AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY)
    );
SELECT COALESCE(SUM(lr.outstandingBalance), 0) INTO v_loans
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
SELECT *
FROM PrintedStatements
WHERE printedStatementID = LAST_INSERT_ID();
END


-- sp_build_coop_ledger_summary
CREATE DEFINER = `root` @`localhost` PROCEDURE `asac_db`.`sp_build_coop_ledger_summary`(
    IN p_primary_coop_id INT,
    IN p_start DATE,
    IN p_end DATE
) BEGIN
SELECT fa.farmerAccountID,
    fa.status AS accountStatus,
    f.farmerID,
    CONCAT(
        f.firstName,
        ' ',
        IFNULL(f.middleName, ''),
        CASE
            WHEN f.middleName IS NULL
            OR f.middleName = '' THEN ''
            ELSE ' '
        END,
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
        SELECT sr.farmerAccountID,
            SUM(sr.grossAmount) AS totalGrossSales,
            SUM(sr.commissionAmount) AS totalCommission,
            SUM(sr.netAmount) AS netBalance
        FROM SalesRecords sr
        WHERE (
                p_start IS NULL
                OR p_end IS NULL
                OR (
                    sr.transactionDate >= p_start
                    AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY)
                )
            )
        GROUP BY sr.farmerAccountID
    ) sa ON sa.farmerAccountID = fa.farmerAccountID
    LEFT JOIN (
        SELECT fr.farmerAccountID,
            SUM(fr.amount) AS totalShareCapital
        FROM FeeRecords fr
            JOIN SalesRecords sr ON fr.salesRecordID = sr.salesRecordID
        WHERE fr.feeType IN ('capitalContribution', 'capitalRetention')
            AND (
                p_start IS NULL
                OR p_end IS NULL
                OR (
                    sr.transactionDate >= p_start
                    AND sr.transactionDate < DATE_ADD(p_end, INTERVAL 1 DAY)
                )
            )
        GROUP BY fr.farmerAccountID
    ) sc ON sc.farmerAccountID = fa.farmerAccountID
    LEFT JOIN (
        SELECT farmerAccountID,
            SUM(outstandingBalance) AS outstandingLoans
        FROM LoanRecords
        WHERE outstandingBalance > 0
        GROUP BY farmerAccountID
    ) lo ON lo.farmerAccountID = fa.farmerAccountID
WHERE fa.primaryCoopID = p_primary_coop_id
    AND f.isDeleted = 0
ORDER BY farmerName ASC;
END