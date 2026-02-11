import mongoose from "mongoose";
import express from "express";
import Transaction from "../models/TransactionSchema.js"; // Adjust the path as needed
import verifyToken from "../middleware/verifyToken.js";
import AdminUser from "../models/AdminUserSchema.js";
import Employee from "../models/EmployeeSchema.js";
import moment from "moment";
const router = express.Router();

// keep your constant
const TRANSACTION_CODES = [1, 3, 4, 5, 6, 7];

/**
 * Returns true when a txn should be treated as CREDIT for that code/flag combo.
 * Based on your original logic:
 *   - for code 4: flag === 1 => credit, flag === 2 => debit
 *   - for other codes: flag === 2 => credit, flag === 1 => debit
 */
const isCredit = (code, flag) => (code === 4 ? flag === 1 : flag === 2);

async function getEmployeeSummary(employeeNo, startDate, endDate) {
  // ensure startDate/endDate are Date objects before calling this function
  const codes = TRANSACTION_CODES.slice();

  // initialize result map with zeroed fields for each code
  const result = {};
  codes.forEach((c) => {
    result[c] = {
      transactionCode: c,
      openingBalance: 0,
      credit: 0,
      debit: 0,
      closingBalance: 0,
    };
  });

  // 1) Opening balances: all transactions BEFORE startDate
  const openingTxns = await Transaction.find({
    employeeNo,
    transactionDate: { $lt: startDate },
    entryStatus: { $ne: "Deleted" },
    transactionCode: { $in: codes },
  }).exec();

  openingTxns.forEach((txn) => {
    const code = txn.transactionCode;
    const amount = Number(txn.amount) || 0;
    if (!result[code]) return;
    if (isCredit(code, txn.flag)) {
      result[code].openingBalance += amount;
    } else {
      result[code].openingBalance -= amount;
    }
  });

  // 2) Transactions within the date range -> accumulate credit/debit totals and net change
  const inRangeTxns = await Transaction.find({
    employeeNo,
    transactionDate: { $gte: startDate, $lte: endDate },
    entryStatus: { $ne: "Deleted" },
    transactionCode: { $in: codes },
  }).exec();

  // netChange[code] will be (credits - debits) in numeric terms
  const netChange = {};
  inRangeTxns.forEach((txn) => {
    const code = txn.transactionCode;
    const amount = Number(txn.amount) || 0;
    if (!result[code]) return;

    if (isCredit(code, txn.flag)) {
      result[code].credit += amount;
      netChange[code] = (netChange[code] || 0) + amount;
    } else {
      result[code].debit += amount;
      netChange[code] = (netChange[code] || 0) - amount;
    }
  });

  // 3) Closing balance = opening + netChangeWithinRange
  codes.forEach((code) => {
    result[code].closingBalance =
      result[code].openingBalance + (netChange[code] || 0);
  });

  // return an array in the same code order
  return codes.map((c) => result[c]);
}

router.get("/summary-sumtotal", async (req, res) => {
    try {
      const { employeeNo, startDate, endDate, page = 1, limit = 10 } = req.query;
      const start = startDate ? new Date(startDate) : new Date("2000-01-01");
      const end = endDate ? new Date(endDate) : new Date();
  
      // If a specific employeeNo was given, restrict list to it
      let employees = [];
      if (employeeNo) {
        employees = [employeeNo];
      } else {
        // consider adding date filter here if you want employees only with txns in range
        employees = await Transaction.distinct("employeeNo", {
          entryStatus: { $ne: "Deleted" },
        });
      }
  
      const allSummaries = await Promise.all(
        employees.map(async (empNo) => {
          const employee = await Employee.findOne({ employeeNo: empNo }).select(
            "name"
          );
          const employeeName = employee ? employee.name : "Unknown";
          const transactions = await getEmployeeSummary(empNo, start, end);
          return {
            employeeNo: empNo,
            employeeName,
            transactions,
          };
        })
      );
  
      // overall totals consolidated by transactionCode
      const overallMap = {};
      allSummaries.forEach((empSummary) => {
        empSummary.transactions.forEach((t) => {
          const code = t.transactionCode;
          if (!overallMap[code]) {
            overallMap[code] = {
              transactionCode: code,
              openingBalance: 0,
              debit: 0,
              credit: 0,
              closingBalance: 0,
            };
          }
          overallMap[code].openingBalance += t.openingBalance || 0;
          overallMap[code].debit += t.debit || 0;
          overallMap[code].credit += t.credit || 0;
          overallMap[code].closingBalance += t.closingBalance || 0;
        });
      });
  
      const overall = Object.values(overallMap);
  
      // pagination on employees
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const paginatedEmployees = allSummaries.slice(
        (pageNum - 1) * limitNum,
        pageNum * limitNum
      );
  
      res.status(200).json({
        currentPage: pageNum,
        totalPages: Math.ceil(employees.length / limitNum),
        overall,
        data: paginatedEmployees,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
export default router;
