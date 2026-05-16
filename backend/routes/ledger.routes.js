import { Router } from "express";
import { createRequire } from "node:module";
import { Op } from "sequelize";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const require = createRequire(import.meta.url);
const db = require("../models/index.js");

const router = Router();

async function getOfficerCoop(userID) {
  return db.PrimaryCooperative.findOne({
    where: { userID, isDeleted: false },
  });
}

function num(v) {
  if (v === null || v === undefined) return 0;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/** Parse period query: all | month | quarter | custom */
function resolvePeriod(query) {
  const { period = "all", startDate, endDate } = query;
  const now = new Date();
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  if (period === "custom" && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: todayEnd };
  }

  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    return { start, end: todayEnd };
  }

  return { start: null, end: null };
}

function computeLoanStatus(loanRow, todayStart) {
  const ob = num(loanRow.outstandingBalance);
  if (ob <= 0.001) return "paid";
  const due = new Date(loanRow.dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < todayStart && ob > 0) return "overdue";
  const repaid = num(loanRow.amountRepaid);
  if (repaid > 0 && ob > 0) return "partial";
  return "active";
}

async function refreshLoanStatusesForAccount(farmerAccountID) {
  const loans = await db.LoanRecord.findAll({
    where: { farmerAccountID },
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const loan of loans) {
    const next = computeLoanStatus(loan, today);
    if (next !== loan.status) await loan.update({ status: next });
  }
}

async function aggregateSalesForAccount(farmerAccountID, dateRange) {
  const where = { farmerAccountID };
  if (dateRange.start && dateRange.end) {
    where.transactionDate = { [Op.between]: [dateRange.start, dateRange.end] };
  }
  const gross = (await db.SalesRecord.sum("grossAmount", { where })) || 0;
  const commission =
    (await db.SalesRecord.sum("commissionAmount", { where })) || 0;
  const net = (await db.SalesRecord.sum("netAmount", { where })) || 0;
  return {
    gross: num(gross),
    commission: num(commission),
    net: num(net),
  };
}

async function aggregateShareCapitalForAccount(farmerAccountID, dateRange) {
  const salesWhere = { farmerAccountID };
  if (dateRange.start && dateRange.end) {
    salesWhere.transactionDate = {
      [Op.between]: [dateRange.start, dateRange.end],
    };
  }
  const sales = await db.SalesRecord.findAll({
    where: salesWhere,
    attributes: ["salesRecordID"],
  });
  const ids = sales.map((s) => s.salesRecordID);
  if (ids.length === 0) return 0;
  const sum =
    (await db.FeeRecord.sum("amount", {
      where: {
        salesRecordID: { [Op.in]: ids },
        feeType: { [Op.in]: ["capitalContribution", "capitalRetention"] },
      },
    })) || 0;
  return num(sum);
}

async function sumOutstandingLoans(farmerAccountID) {
  const loans = await db.LoanRecord.findAll({
    where: {
      farmerAccountID,
      outstandingBalance: { [Op.gt]: 0 },
    },
  });
  return loans.reduce((s, l) => s + num(l.outstandingBalance), 0);
}

function farmerFullName(f) {
  const parts = [f.firstName];
  if (f.middleName) parts.push(f.middleName);
  parts.push(f.lastName);
  if (f.suffixName) parts.push(f.suffixName);
  return parts.join(" ");
}

async function assertCoopAccess(req, coopId) {
  const id = parseInt(String(coopId), 10);
  if (!Number.isFinite(id))
    return { error: { status: 400, message: "Invalid cooperative ID" } };

  const coop = await db.PrimaryCooperative.findOne({
    where: { primaryCoopID: id, isDeleted: false },
  });
  if (!coop)
    return { error: { status: 404, message: "Cooperative not found" } };

  if (req.user.role === "Admin") return { coop };

  const officerCoop = await getOfficerCoop(req.user.userID);
  if (!officerCoop || officerCoop.primaryCoopID !== id) {
    return { error: { status: 403, message: "Not your cooperative" } };
  }
  return { coop };
}

async function resolveFarmerLedgerContext(req, farmerIdParam, coopIdQuery) {
  const farmerID = parseInt(String(farmerIdParam), 10);
  if (!Number.isFinite(farmerID))
    return { error: { status: 400, message: "Invalid farmer ID" } };

  const farmer = await db.Farmer.findOne({
    where: { farmerID, isDeleted: false },
  });
  if (!farmer) return { error: { status: 404, message: "Farmer not found" } };

  const accounts = await db.FarmerAccount.findAll({
    where: { farmerID },
    include: [
      {
        model: db.PrimaryCooperative,
        attributes: ["primaryCoopID", "coopName", "barangay", "municipality"],
      },
    ],
  });

  if (accounts.length === 0) {
    return {
      farmer,
      accounts: [],
      error: null,
    };
  }

  let selected = accounts;

  if (req.user.role === "Farmer") {
    const userFarmer = await db.Farmer.findOne({
      where: { userID: req.user.userID, isDeleted: false },
    });
    if (!userFarmer || userFarmer.farmerID !== farmerID) {
      return {
        error: { status: 403, message: "You can only view your own ledger" },
      };
    }
    selected = accounts;
    return { farmer, accounts: selected, needsCoopId: false, error: null };
  }

  if (req.user.role === "Officer") {
    const oc = await getOfficerCoop(req.user.userID);
    if (!oc)
      return { error: { status: 403, message: "Cooperative not found" } };
    selected = accounts.filter((a) => a.primaryCoopID === oc.primaryCoopID);
    if (selected.length === 0) {
      return {
        error: { status: 403, message: "Farmer not in your cooperative" },
      };
    }
  }

  if (req.user.role === "Admin" && coopIdQuery) {
    const cid = parseInt(String(coopIdQuery), 10);
    selected = accounts.filter((a) => a.primaryCoopID === cid);
    if (selected.length === 0) {
      return {
        error: {
          status: 400,
          message: "Farmer has no account for that cooperative",
        },
      };
    }
  } else if (req.user.role === "Admin" && accounts.length > 1 && !coopIdQuery) {
    return {
      farmer,
      accounts,
      needsCoopId: true,
      error: null,
    };
  }

  return { farmer, accounts: selected, needsCoopId: false, error: null };
}

async function buildAccountLedgerPayload(farmerAccountID) {
  await db.sequelize.query("CALL sp_refresh_loan_statuses(:farmerAccountID)", {
    replacements: { farmerAccountID },
  });

  const farmerAccount = await db.FarmerAccount.findByPk(farmerAccountID, {
    include: [
      {
        model: db.Farmer,
        attributes: [
          "farmerID",
          "firstName",
          "middleName",
          "lastName",
          "suffixName",
          "farmName",
        ],
      },
      {
        model: db.PrimaryCooperative,
        attributes: ["primaryCoopID", "coopName", "barangay", "municipality"],
      },
    ],
  });

  if (!farmerAccount) return null;

  const [summaryRows] = await db.sequelize.query(
    "CALL sp_get_account_ledger_summary(:farmerAccountID, :start, :end)",
    {
      replacements: { farmerAccountID, start: null, end: null },
    },
  );
  const summaryRow = Array.isArray(summaryRows) ? summaryRows[0] : summaryRows;
  const summary = {
    totalGrossSales: num(summaryRow?.totalGrossSales || 0),
    totalCommission: num(summaryRow?.totalCommission || 0),
    totalShareCapital: num(summaryRow?.totalShareCapital || 0),
    netBalance: num(summaryRow?.netBalance || 0),
    outstandingLoans: num(summaryRow?.outstandingLoans || 0),
  };

  const salesRecords = await db.SalesRecord.findAll({
    where: { farmerAccountID },
    include: [
      {
        model: db.DeliveryRecord,
        attributes: ["deliveryID", "status"],
      },
    ],
    order: [["transactionDate", "DESC"]],
  });

  const feeRecords = await db.FeeRecord.findAll({
    where: { farmerAccountID },
    include: [
      {
        model: db.SalesRecord,
        attributes: ["salesRecordID", "transactionDate", "deliveryID"],
      },
    ],
    order: [["feeRecordID", "ASC"]],
  });

  const loans = await db.LoanRecord.findAll({
    where: { farmerAccountID },
    include: [
      {
        model: db.User,
        as: "approvedByUser",
        attributes: ["email"],
      },
    ],
    order: [["releaseDate", "DESC"]],
  });

  return {
    farmerAccount: {
      farmerAccountID: farmerAccount.farmerAccountID,
      farmerID: farmerAccount.farmerID,
      primaryCoopID: farmerAccount.primaryCoopID,
      status: farmerAccount.status,
      createdDate: farmerAccount.createdDate,
    },
    farmer: farmerAccount.Farmer,
    cooperative: farmerAccount.PrimaryCooperative,
    summary,
    salesRecords: salesRecords.map((s) => ({
      salesRecordID: s.salesRecordID,
      deliveryID: s.deliveryID,
      grossAmount: num(s.grossAmount),
      commissionAmount: num(s.commissionAmount),
      netAmount: num(s.netAmount),
      transactionDate: s.transactionDate,
      remarks: s.remarks,
    })),
    feeRecords: feeRecords.map((f) => ({
      feeRecordID: f.feeRecordID,
      salesRecordID: f.salesRecordID,
      feeType: f.feeType,
      rate: num(f.rate),
      amount: num(f.amount),
      status: f.status,
      transactionDate: f.SalesRecord?.transactionDate ?? null,
    })),
    loans: loans.map((l) => ({
      loanRecordID: l.loanRecordID,
      loanAmount: num(l.loanAmount),
      purpose: l.purpose,
      releaseDate: l.releaseDate,
      dueDate: l.dueDate,
      amountRepaid: num(l.amountRepaid),
      outstandingBalance: num(l.outstandingBalance),
      status: l.status,
    })),
  };
}

async function buildCoopLedgerResponse(req, coopId) {
  const check = await assertCoopAccess(req, coopId);
  if (check.error) return { error: check.error };

  const dateRange = resolvePeriod(req.query);
  const { search, status } = req.query;

  const whereAccount = { primaryCoopID: coopId };
  if (status && status !== "all") {
    whereAccount.status = status;
  }

  const [summaryRows] = await db.sequelize.query(
    "CALL sp_build_coop_ledger_summary(:coopId, :start, :end)",
    {
      replacements: {
        coopId,
        start: dateRange.start ?? null,
        end: dateRange.end ?? null,
      },
    },
  );

  let rows = Array.isArray(summaryRows) ? summaryRows : [];
  if (search) {
    const q = String(search).toLowerCase();
    rows = rows.filter((row) => {
      const name = String(row.farmerName || "").toLowerCase();
      return name.includes(q) || String(row.farmerID).includes(q);
    });
  }

  rows = rows.map((row) => ({
    farmerID: row.farmerID,
    farmerName: row.farmerName,
    farmerAccountID: row.farmerAccountID,
    accountStatus: row.accountStatus,
    totalGrossSales: num(row.totalGrossSales),
    totalCommission: num(row.totalCommission),
    totalShareCapital: num(row.totalShareCapital),
    outstandingLoans: num(row.outstandingLoans),
    netBalance: num(row.netBalance),
  }));

  return {
    data: {
      primaryCoopID: coopId,
      cooperative: check.coop
        ? {
            coopName: check.coop.coopName,
            primaryCoopID: check.coop.primaryCoopID,
          }
        : null,
      period: req.query.period || "all",
      rows,
    },
  };
}

/** @param {import('express').Request} req */
async function buildFarmerLedgerResponse(req, farmerIdStr) {
  const coopIdQuery = req.query.coopId;
  const ctx = await resolveFarmerLedgerContext(req, farmerIdStr, coopIdQuery);
  if (ctx.error) return { error: ctx.error };

  if (ctx.needsCoopId) {
    return {
      data: {
        farmer: ctx.farmer,
        needsCoopId: true,
        membershipChoices: (ctx.accounts || []).map((a) => ({
          farmerAccountID: a.farmerAccountID,
          primaryCoopID: a.primaryCoopID,
          coopName: a.PrimaryCooperative?.coopName,
          status: a.status,
        })),
        ledgers: [],
      },
    };
  }

  if (!ctx.accounts || ctx.accounts.length === 0) {
    return {
      data: {
        farmer: ctx.farmer,
        needsCoopId: false,
        ledgers: [],
      },
    };
  }

  const payloads = [];
  for (const acc of ctx.accounts) {
    const ledger = await buildAccountLedgerPayload(acc.farmerAccountID);
    if (ledger) payloads.push(ledger);
  }

  return {
    data: {
      farmer: ctx.farmer,
      needsCoopId: false,
      ledgers: payloads,
    },
  };
}

// ─────────────────────────────────────────────────────────
// GET /api/ledger/summary — Federation overview (Admin)
// ─────────────────────────────────────────────────────────
router.get("/summary", authenticate, authorize("Admin"), async (_req, res) => {
  try {
    const deliveriesCompleted = await db.DeliveryRecord.count({
      where: { status: "delivered" },
    });

    const totalGrossSales = num((await db.SalesRecord.sum("grossAmount")) || 0);
    const totalFederationFees = num(
      (await db.FeeRecord.sum("amount", {
        where: { feeType: "federationFee" },
      })) || 0,
    );
    const totalCooperativeFees = num(
      (await db.FeeRecord.sum("amount", {
        where: { feeType: "coopFee" },
      })) || 0,
    );
    const totalShareCapital = num(
      (await db.FeeRecord.sum("amount", {
        where: {
          feeType: { [Op.in]: ["capitalContribution", "capitalRetention"] },
        },
      })) || 0,
    );

    const coops = await db.PrimaryCooperative.findAll({
      where: { isDeleted: false },
      attributes: ["primaryCoopID", "coopName"],
      order: [["coopName", "ASC"]],
    });

    const cooperativeSummary = [];
    for (const coop of coops) {
      const accounts = await db.FarmerAccount.findAll({
        where: { primaryCoopID: coop.primaryCoopID },
        attributes: ["farmerAccountID", "farmerID"],
      });
      const accountIds = accounts.map((a) => a.farmerAccountID);
      const farmerIds = [...new Set(accounts.map((a) => a.farmerID))];

      let totalGross = 0;
      let totalNet = 0;
      let fed = 0;
      let coopFee = 0;

      if (accountIds.length > 0) {
        totalGross = num(
          (await db.SalesRecord.sum("grossAmount", {
            where: { farmerAccountID: { [Op.in]: accountIds } },
          })) || 0,
        );
        totalNet = num(
          (await db.SalesRecord.sum("netAmount", {
            where: { farmerAccountID: { [Op.in]: accountIds } },
          })) || 0,
        );
        fed = num(
          (await db.FeeRecord.sum("amount", {
            where: {
              farmerAccountID: { [Op.in]: accountIds },
              feeType: "federationFee",
            },
          })) || 0,
        );
        coopFee = num(
          (await db.FeeRecord.sum("amount", {
            where: {
              farmerAccountID: { [Op.in]: accountIds },
              feeType: "coopFee",
            },
          })) || 0,
        );
      }

      cooperativeSummary.push({
        primaryCoopID: coop.primaryCoopID,
        coopName: coop.coopName,
        farmersWithAccounts: farmerIds.length,
        totalGrossSales: totalGross,
        totalNetEarnings: totalNet,
        totalFederationFee: fed,
        totalCooperativeFee: coopFee,
      });
    }

    res.json({
      deliveriesCompleted,
      totalGrossSales,
      totalFederationFees,
      totalCooperativeFees,
      totalShareCapital,
      cooperativeSummary,
    });
  } catch (err) {
    console.error("Ledger summary error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────────────────
// GET /api/ledger/coops/me — Officer cooperative ledger list
// ─────────────────────────────────────────────────────────
router.get(
  "/coops/me",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    try {
      const coop = await getOfficerCoop(req.user.userID);
      if (!coop)
        return res.status(404).json({ message: "Cooperative not found" });
      const result = await buildCoopLedgerResponse(req, coop.primaryCoopID);
      if (result.error) {
        return res
          .status(result.error.status)
          .json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (err) {
      console.error("Ledger coop/me error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────
// GET /api/ledger/coops/:coopId — Cooperative ledger rows
// ─────────────────────────────────────────────────────────
router.get(
  "/coops/:coopId",
  authenticate,
  authorize("Admin", "Officer"),
  async (req, res) => {
    try {
      const coopId = parseInt(req.params.coopId, 10);
      const result = await buildCoopLedgerResponse(req, coopId);
      if (result.error) {
        return res
          .status(result.error.status)
          .json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (err) {
      console.error("Ledger coop list error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────
// GET /api/ledger/farmers/me — Farmer own ledger
// ─────────────────────────────────────────────────────────
router.get(
  "/farmers/me",
  authenticate,
  authorize("Farmer"),
  async (req, res) => {
    try {
      const farmer = await db.Farmer.findOne({
        where: { userID: req.user.userID, isDeleted: false },
      });
      if (!farmer)
        return res.status(404).json({ message: "Farmer profile not found" });

      const result = await buildFarmerLedgerResponse(
        req,
        String(farmer.farmerID),
      );
      if (result.error) {
        return res
          .status(result.error.status)
          .json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (err) {
      console.error("Ledger farmers/me error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────
// GET /api/ledger/farmers/:farmerId — Ledger detail
// ─────────────────────────────────────────────────────────
router.get(
  "/farmers/:farmerId",
  authenticate,
  authorize("Admin", "Officer", "Farmer"),
  async (req, res) => {
    try {
      const result = await buildFarmerLedgerResponse(req, req.params.farmerId);
      if (result.error) {
        return res
          .status(result.error.status)
          .json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (err) {
      console.error("Ledger farmer detail error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

async function resolveTargetFarmerAccount(req, farmerIdStr, body = {}) {
  const farmerID = parseInt(String(farmerIdStr), 10);
  if (!Number.isFinite(farmerID))
    return { error: { status: 400, message: "Invalid farmer ID" } };

  const farmer = await db.Farmer.findOne({
    where: { farmerID, isDeleted: false },
  });
  if (!farmer) return { error: { status: 404, message: "Farmer not found" } };

  const accounts = await db.FarmerAccount.findAll({
    where: { farmerID },
    include: [{ model: db.PrimaryCooperative }],
  });

  let account = null;
  if (body.farmerAccountID != null) {
    account = accounts.find(
      (a) => a.farmerAccountID === Number(body.farmerAccountID),
    );
  } else if (body.coopId != null) {
    account = accounts.find((a) => a.primaryCoopID === Number(body.coopId));
  } else if (accounts.length === 1) {
    account = accounts[0];
  }

  if (!account) {
    return {
      error: {
        status: 400,
        message:
          accounts.length > 1
            ? "Specify farmerAccountID or coopId for this farmer"
            : "No farmer account found",
      },
    };
  }

  if (req.user.role === "Farmer") {
    const uf = await db.Farmer.findOne({
      where: { userID: req.user.userID, isDeleted: false },
    });
    if (!uf || uf.farmerID !== farmerID) {
      return {
        error: { status: 403, message: "You can only access your own ledger" },
      };
    }
  } else if (req.user.role === "Officer") {
    const oc = await getOfficerCoop(req.user.userID);
    if (!oc || account.primaryCoopID !== oc.primaryCoopID) {
      return {
        error: { status: 403, message: "Not allowed for this account" },
      };
    }
  }

  return { farmer, account };
}

// ─────────────────────────────────────────────────────────
// POST /api/ledger/farmers/:farmerId/statement — Snapshot
// ─────────────────────────────────────────────────────────
router.post(
  "/farmers/:farmerId/statement",
  authenticate,
  authorize("Admin", "Officer", "Farmer"),
  async (req, res) => {
    try {
      const { periodStart, periodEnd, farmerAccountID, coopId } = req.body;
      if (!periodStart || !periodEnd) {
        return res
          .status(400)
          .json({ message: "periodStart and periodEnd are required" });
      }

      const ctx = await resolveTargetFarmerAccount(req, req.params.farmerId, {
        farmerAccountID,
        coopId,
      });
      if (ctx.error) {
        return res
          .status(ctx.error.status)
          .json({ message: ctx.error.message });
      }

      const start = new Date(periodStart);
      const end = new Date(periodEnd);

      await db.sequelize.query("SET @generated_by = :generatedBy", {
        replacements: { generatedBy: req.user.userID },
      });

      const [rows] = await db.sequelize.query(
        "CALL sp_generate_statement(:farmerAccountID, :start, :end)",
        {
          replacements: {
            farmerAccountID: ctx.account.farmerAccountID,
            start,
            end,
          },
        },
      );

      const statement = Array.isArray(rows) ? rows[0] : rows;
      if (!statement) {
        return res
          .status(500)
          .json({ message: "Failed to generate statement" });
      }

      res.status(201).json({
        statement: {
          printedStatementID: statement.printedStatementID,
          farmerAccountID: statement.farmerAccountID,
          periodStart: statement.periodStart,
          periodEnd: statement.periodEnd,
          generatedDate: statement.generatedDate,
          totalGrossSales: num(statement.totalGrossSales),
          totalCommission: num(statement.totalCommission),
          totalShareCapital: num(statement.totalShareCapital),
          totalLoans: num(statement.totalLoans),
          netBalance: num(statement.netBalance),
        },
      });
    } catch (err) {
      console.error("Ledger statement error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────
// POST /api/ledger/farmers/:farmerId/loans — Create loan (Officer)
// ─────────────────────────────────────────────────────────
router.post(
  "/farmers/:farmerId/loans",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const {
        loanAmount,
        purpose,
        releaseDate,
        dueDate,
        farmerAccountID,
        coopId,
      } = req.body;

      if (loanAmount === undefined || !purpose || !releaseDate || !dueDate) {
        await t.rollback();
        return res.status(400).json({
          message: "loanAmount, purpose, releaseDate, and dueDate are required",
        });
      }

      const ctx = await resolveTargetFarmerAccount(req, req.params.farmerId, {
        farmerAccountID,
        coopId,
      });
      if (ctx.error) {
        await t.rollback();
        return res
          .status(ctx.error.status)
          .json({ message: ctx.error.message });
      }

      const lamt = num(loanAmount);
      if (lamt <= 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Loan amount must be positive" });
      }

      const loan = await db.LoanRecord.create(
        {
          farmerAccountID: ctx.account.farmerAccountID,
          loanAmount: lamt,
          purpose: String(purpose),
          releaseDate,
          dueDate,
          amountRepaid: 0,
          outstandingBalance: lamt,
          status: "active",
          approvedBy: req.user.userID,
        },
        { transaction: t },
      );

      await t.commit();

      res.status(201).json({
        loan: {
          loanRecordID: loan.loanRecordID,
          loanAmount: num(loan.loanAmount),
          purpose: loan.purpose,
          releaseDate: loan.releaseDate,
          dueDate: loan.dueDate,
          amountRepaid: num(loan.amountRepaid),
          outstandingBalance: num(loan.outstandingBalance),
          status: loan.status,
        },
      });
    } catch (err) {
      await t.rollback();
      console.error("Ledger create loan error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// ─────────────────────────────────────────────────────────
// PUT /api/ledger/loans/:loanId/repayment — Officer
// ─────────────────────────────────────────────────────────
router.put(
  "/loans/:loanId/repayment",
  authenticate,
  authorize("Officer"),
  async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { repaymentAmount, repaymentDate } = req.body;
      const lamt = num(repaymentAmount);
      if (!lamt || lamt <= 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Repayment amount must be greater than 0" });
      }

      const loan = await db.LoanRecord.findByPk(req.params.loanId, {
        transaction: t,
        lock: db.Sequelize.Transaction.LOCK.UPDATE,
        include: [{ model: db.FarmerAccount }],
      });

      if (!loan) {
        await t.rollback();
        return res.status(404).json({ message: "Loan not found" });
      }

      const oc = await getOfficerCoop(req.user.userID);
      if (!oc || loan.FarmerAccount.primaryCoopID !== oc.primaryCoopID) {
        await t.rollback();
        return res.status(403).json({ message: "Not allowed for this loan" });
      }

      const ob = num(loan.outstandingBalance);
      if (lamt > ob + 0.001) {
        await t.rollback();
        return res.status(400).json({
          message: "Repayment cannot exceed outstanding balance",
        });
      }

      const newRepaid = num(loan.amountRepaid) + lamt;
      const newOutstanding = Math.max(0, parseFloat((ob - lamt).toFixed(2)));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(loan.dueDate);
      due.setHours(0, 0, 0, 0);

      let status = "active";
      if (newOutstanding <= 0.001) {
        status = "paid";
      } else if (due < today && newOutstanding > 0) {
        status = "overdue";
      } else if (newRepaid > 0 && newOutstanding > 0) {
        status = "partial";
      }

      await loan.update(
        {
          amountRepaid: newRepaid,
          outstandingBalance: newOutstanding,
          status,
        },
        { transaction: t },
      );

      await t.commit();

      res.json({
        loan: {
          loanRecordID: loan.loanRecordID,
          amountRepaid: newRepaid,
          outstandingBalance: newOutstanding,
          status,
        },
        repaymentDate: repaymentDate || new Date().toISOString(),
      });
    } catch (err) {
      await t.rollback();
      console.error("Ledger repayment error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
