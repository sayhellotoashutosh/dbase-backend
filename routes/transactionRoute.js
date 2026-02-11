import mongoose from "mongoose";
import express from "express";
import Transaction from "../models/TransactionSchema.js"; // Adjust the path as needed
import verifyToken from "../middleware/verifyToken.js";
import AdminUser from "../models/AdminUserSchema.js";
import Employee from "../models/EmployeeSchema.js";
import moment from "moment";
const router = express.Router();

// Add transaction
router.post("/add-single", verifyToken, async (req, res) => {
  //Validate Token
  const id = req.userId;
  const userDetails = await AdminUser.find({ userId: id }).select("-password");
  if (!userDetails) return res.status(400).json({ error: "Invalid Token!" });

  const {
    employeeNo,
    transactionDate,
    transactionMonth,
    transactionCode,
    flag,
    amount,
    security1,
    security2,
    entryType,
  } = req.body;

  // Validate required fields
  if (
    !employeeNo ||
    !transactionDate ||
    !transactionMonth ||
    !transactionCode ||
    !flag ||
    !amount ||
    !entryType
  ) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const ValidateEmployeeNo = await Employee.find({ employeeNo });
  if (!ValidateEmployeeNo) {
    return res.status(400).json({ error: "Employee not found." });
  }

  // Validate transaction code and flag
  const validMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const validTransactionCodes = [1, 2, 3, 4, 5, 6, 7];
  const validFlags = [1, 2];
  // Ensure transactionCode and flag are numbers
  const transactionCode1 = Number(transactionCode);
  const flag1 = Number(flag);
  const transactionMonth1 = Number(transactionMonth);
  const amount1 = mongoose.Types.Decimal128.fromString(amount.toString()); // Convert to Decimal128

  if (
    !validTransactionCodes.includes(transactionCode1) ||
    !validFlags.includes(flag1) ||
    !validMonths.includes(transactionMonth1)
  ) {
    return res.status(400).json({ error: "Invalid transaction code or flag." });
  }

  // Additional validation for transactionCode 4 and flag 1
  if (transactionCode1 === 4 && flag1 === 1) {
    if (!security1 || !security2) {
      return res
        .status(400)
        .json({
          error:
            "security1 and security2 are required when transactionCode is 4 and flag is 1.",
        });
    }
  }

  let parsedTransactionDate = new Date(transactionDate);
  if (isNaN(parsedTransactionDate)) {
    console.warn("Invalid transaction date format. Using today's date.");
    parsedTransactionDate = new Date(); // fallback to today's date
  }

  try {
    const transaction = new Transaction({
      employeeNo,
      transactionDate: parsedTransactionDate,
      transactionMonth,
      transactionCode,
      flag,
      amount: amount1,
      createdBy: id,
      security1, // Include security1 if provided
      security2, // Include security2 if provided
      entryType,
    });

    await transaction.save();
    res
      .status(201)
      .json({ message: "Transaction added successfully", transaction });
  } catch (err) {
    console.log("Error:");
    console.error("Error adding transaction:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add transaction
router.post("/add", verifyToken, async (req, res) => {
  //Validate Token
  console.log("Hit");
  const id = req.userId;
  const userDetails = await AdminUser.find({ userId: id }).select("-password");
  if (!userDetails) return res.status(400).json({ error: "Invalid Token!" });

  const {
    employeeNo,
    transactionDate,
    transactionMonth,
    transactionCode,
    flag,
    amount,
    security1,
    security2,
    entryType,
  } = req.body;

  // Validate required fields
  if (
    !employeeNo ||
    !transactionDate ||
    !transactionMonth ||
    !transactionCode ||
    !flag ||
    !amount ||
    !entryType
  ) {
    return res.status(400).json({ error: "Required fields are missing." });
  }
  console.log("2");

  const ValidateEmployeeNo = await Employee.find({ employeeNo });
  if (!ValidateEmployeeNo) {
    return res.status(400).json({ error: "Employee not found." });
  }

  // Convert `transactionDate` from "dd/MM/yyyy" to proper Date object
  const parsedTransactionDate = moment
    .utc(transactionDate, "DD/MM/YYYY")
    .startOf("day")
    .toISOString();

  // Validate transaction code and flag
  const validMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const validTransactionCodes = [1, 2, 3, 4, 5, 6, 7];
  const validFlags = [1, 2];
  // Ensure transactionCode and flag are numbers
  const transactionCode1 = Number(transactionCode);
  const flag1 = Number(flag);
  const transactionMonth1 = Number(transactionMonth);
  const amount1 = mongoose.Types.Decimal128.fromString(amount.toString()); // Convert to Decimal128

  if (
    !validTransactionCodes.includes(transactionCode1) ||
    !validFlags.includes(flag1) ||
    !validMonths.includes(transactionMonth1)
  ) {
    return res.status(400).json({ error: "Invalid transaction code or flag." });
  }

  // Additional validation for transactionCode 4 and flag 1
  if (transactionCode1 === 4 && flag1 === 1) {
    if (!security1 || !security2) {
      return res
        .status(400)
        .json({
          error:
            "security1 and security2 are required when transactionCode is 4 and flag is 1.",
        });
    }
  }

  try {
    const transaction = new Transaction({
      employeeNo,
      transactionDate: parsedTransactionDate,
      transactionMonth,
      transactionCode,
      flag,
      amount: amount1,
      createdBy: id,
      security1, // Include security1 if provided
      security2, // Include security2 if provided
      entryType,
    });

    await transaction.save();
    console.log("Save:", employeeNo);
    res
      .status(201)
      .json({ message: "Transaction added successfully", transaction });
  } catch (err) {
    console.log("Error:");
    console.error("Error adding transaction:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/list-without-empname", async (req, res) => {
  try {
    const {
      page = 1, // Default to page 1
      limit = 15, // Default to 15 records per page
      employeeNo,
      transactionCode,
      flag,
      startDate,
      endDate,
    } = req.query;

    // Pagination
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Build query object
    const query = {};

    if (employeeNo) {
      query.employeeNo = employeeNo; // Exact match
    }

    if (transactionCode) {
      query.transactionCode = parseInt(transactionCode, 10); // Ensure it's a number
    }

    if (flag) {
      query.flag = parseInt(flag, 10); // Ensure it's a number
    }

    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.transactionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.transactionDate = { $lte: new Date(endDate) };
    }

    query.entryStatus = { $ne: "Deleted" };
    // Fetch data with pagination and filtering
    const transactions = await Transaction.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ transactionDate: -1 }); // Sort by transactionDate descending

    // Get total records for pagination
    const totalRecords = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: pageNumber,
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/list", async (req, res) => {
  try {
    const {
      page = 1, // Default to page 1
      limit = 15, // Default to 15 records per page
      employeeNo,
      transactionCode,
      flag,
      startDate,
      endDate,
    } = req.query;

    // Pagination
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Build query object for transactions
    const query = {};

    if (employeeNo) {
      query.employeeNo = parseInt(employeeNo, 10); // Ensure it's a number
    }

    if (transactionCode) {
      query.transactionCode = parseInt(transactionCode, 10); // Ensure it's a number
    }

    if (flag) {
      query.flag = parseInt(flag, 10); // Ensure it's a number
    }

    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.transactionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.transactionDate = { $lte: new Date(endDate) };
    }

    query.entryStatus = { $ne: "Deleted" };

    // Fetch transaction data with employee details
    const transactions = await Transaction.aggregate([
      { $match: query },
      { $sort: { transactionDate: -1 } }, // Sort by transactionDate descending
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $lookup: {
          from: "test_employee_sr01", // Employee collection name
          localField: "employeeNo",
          foreignField: "employeeNo",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "test_employee_sr01", // Employee collection name
          localField: "security1", // Transaction's security1
          foreignField: "employeeNo", // Employee's employeeNo
          as: "security1Details",
        },
      },
      {
        $lookup: {
          from: "test_employee_sr01", // Employee collection name
          localField: "security2", // Transaction's security2
          foreignField: "employeeNo", // Employee's employeeNo
          as: "security2Details",
        },
      },
      {
        $addFields: {
          employeeName: { $arrayElemAt: ["$employeeDetails.name", 0] },
          security1Name: { $arrayElemAt: ["$security1Details.name", 0] },
          security2Name: { $arrayElemAt: ["$security2Details.name", 0] },
        },
      },
      {
        $project: {
          employeeDetails: 0, // Exclude the full employeeDetails field
          security1Details: 0, // Exclude the full security1Details field
          security2Details: 0, // Exclude the full security2Details field
        },
      },
    ]);

    // Get total records for pagination
    const totalRecords = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: pageNumber,
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/list-withbalance-old-not-in-use", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      employeeNo, // Employee number to filter
      transactionCode,
      flag,
      startDate,
      endDate,
    } = req.query;

    if (!employeeNo) {
      return res.status(400).json({ message: "employeeNo is required." });
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Parse employeeNo to ensure it's a number
    const empNo = parseInt(employeeNo, 10);
    const employeeName = await Employee.findOne({ employeeNo: empNo });
    // Build query for transactions related to the specified employeeNo
    const query = { employeeNo: empNo, entryStatus: { $ne: "Deleted" } };

    if (transactionCode) {
      query.transactionCode = parseInt(transactionCode, 10);
    }

    if (flag) {
      query.flag = parseInt(flag, 10);
    }

    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.transactionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.transactionDate = { $lte: new Date(endDate) };
    }

    // Calculate Opening Balance (Before Start Date)
    let openingBalance = 0;
    if (startDate) {
      const openingTransactions = await Transaction.aggregate([
        {
          $match: {
            employeeNo: empNo,
            transactionDate: { $lt: new Date(startDate) },
            entryStatus: { $ne: "Deleted" },
          },
        },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [
                  { $eq: ["$flag", 1] },
                  "$amount",
                  { $multiply: ["$amount", -1] },
                ],
              },
            },
          },
        },
      ]);
      openingBalance =
        openingTransactions.length > 0
          ? parseFloat(openingTransactions[0].balance).toFixed(2)
          : "0.00";
    }

    // Fetch Transactions for Current Period
    const transactions = await Transaction.aggregate([
      { $match: query },
      { $sort: { transactionDate: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $lookup: {
          from: "test_employee_sr01",
          localField: "employeeNo",
          foreignField: "employeeNo",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "test_employee_sr01",
          localField: "security1",
          foreignField: "employeeNo",
          as: "security1Details",
        },
      },
      {
        $lookup: {
          from: "test_employee_sr01",
          localField: "security2",
          foreignField: "employeeNo",
          as: "security2Details",
        },
      },
      {
        $addFields: {
          employeeName: {
            $ifNull: [{ $arrayElemAt: ["$employeeDetails.name", 0] }, ""],
          },
          security1Name: {
            $ifNull: [{ $arrayElemAt: ["$security1Details.name", 0] }, ""],
          },
          security2Name: {
            $ifNull: [{ $arrayElemAt: ["$security2Details.name", 0] }, ""],
          },
        },
      },
      {
        $project: {
          employeeDetails: 0,
          security1Details: 0,
          security2Details: 0,
        },
      },
    ]);

    // Calculate Closing Balance (Opening Balance + Transactions in Period)
    const closingBalance = transactions
      .reduce((acc, txn) => {
        const amount = parseFloat(txn.amount.toString()); // Convert Decimal128 to string first
        return txn.flag === 1 ? acc + amount : acc - amount;
      }, parseFloat(openingBalance))
      .toFixed(2);

    // Get total records for pagination
    const totalRecords = await Transaction.countDocuments(query);
    res.status(200).json({
      employeeName: employeeName.name,
      employeeNo: empNo,
      openingBalance,
      closingBalance,
      transactions,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: pageNumber,
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/list-withbalance", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      employeeNo,
      transactionCode,
      flag,
      startDate,
      endDate,
    } = req.query;

    if (!employeeNo) {
      return res.status(400).json({ message: "employeeNo is required." });
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const empNo = parseInt(employeeNo, 10);

    const employeeName = await Employee.findOne({ employeeNo: empNo });

    // Build query for transactions
    const query = { employeeNo: empNo, entryStatus: { $ne: "Deleted" } };

    if (transactionCode) {
      query.transactionCode = parseInt(transactionCode, 10);
    }

    if (flag) {
      query.flag = parseInt(flag, 10);
    }

    if (startDate && endDate) {
      query.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      query.transactionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.transactionDate = { $lte: new Date(endDate) };
    }

    // -------------------------
    // Calculate Opening Balance
    // -------------------------
    let openingBalance = 0;
    if (startDate) {
      const openingMatch = {
        employeeNo: empNo,
        transactionDate: { $lt: new Date(startDate) },
        entryStatus: { $ne: "Deleted" },
      };

      if (transactionCode) {
        openingMatch.transactionCode = parseInt(transactionCode, 10);
      }

      const openingTransactions = await Transaction.aggregate([
        { $match: openingMatch },
        {
          $group: {
            _id: null,
            balance: {
              $sum: {
                $cond: [
                  { $eq: ["$flag", 1] },
                  "$amount",
                  { $multiply: ["$amount", -1] },
                ],
              },
            },
          },
        },
      ]);

      openingBalance =
        openingTransactions.length > 0
          ? parseFloat(openingTransactions[0].balance).toFixed(2)
          : "0.00";
    }

    // -------------------------
    // Current Period Transactions
    // -------------------------
    const transactions = await Transaction.aggregate([
      { $match: query },
      { $sort: { transactionDate: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      {
        $lookup: {
          from: "test_employee_sr01",
          localField: "employeeNo",
          foreignField: "employeeNo",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "test_employee_sr01",
          localField: "security1",
          foreignField: "employeeNo",
          as: "security1Details",
        },
      },
      {
        $lookup: {
          from: "test_employee_sr01",
          localField: "security2",
          foreignField: "employeeNo",
          as: "security2Details",
        },
      },
      {
        $addFields: {
          employeeName: {
            $ifNull: [{ $arrayElemAt: ["$employeeDetails.name", 0] }, ""],
          },
          security1Name: {
            $ifNull: [{ $arrayElemAt: ["$security1Details.name", 0] }, ""],
          },
          security2Name: {
            $ifNull: [{ $arrayElemAt: ["$security2Details.name", 0] }, ""],
          },
        },
      },
      {
        $project: {
          employeeDetails: 0,
          security1Details: 0,
          security2Details: 0,
        },
      },
    ]);

    // -------------------------
    // Closing Balance
    // -------------------------
    const closingBalance = transactions
      .reduce((acc, txn) => {
        const amount = parseFloat(txn.amount.toString());
        return txn.flag === 1 ? acc + amount : acc - amount;
      }, parseFloat(openingBalance))
      .toFixed(2);

    // Pagination count
    const totalRecords = await Transaction.countDocuments(query);

    res.status(200).json({
      employeeName: employeeName?.name || "",
      employeeNo: empNo,
      openingBalance,
      closingBalance,
      transactions,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: pageNumber,
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updateData = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: "Error updating transaction" });
  }
});

// Delete transaction by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Update the entryStatus to "Deleted"
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { entryStatus: "Deleted" },
      { new: true } // Return the updated document
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    res
      .status(200)
      .json({ message: "Transaction marked as deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark transaction as deleted." });
  }
});

// Transaction codes that must always be included
const TRANSACTION_CODES = [1, 3, 4, 5, 6, 7];

// Function to get balances for an employee within a date range
async function getEmployeeSummary(employeeNo, startDate, endDate) {
  // Fetch transactions within the date range
  const transactions = await Transaction.find({
    employeeNo,
    transactionDate: { $gte: startDate, $lte: endDate },
    entryStatus: { $ne: "Deleted" },
  })
    .sort("transactionDate")
    .exec();

  let balanceMap = {};

  // Initialize balanceMap
  TRANSACTION_CODES.forEach((code) => {
    balanceMap[code] = {
      transactionCode: code,
      openingBalance: 0,
      credit: 0,
      debit: 0,
      closingBalance: 0,
    };
  });

  let openingBalances = {};

  // Calculate opening balances BEFORE startDate
  const openingTransactions = await Transaction.find({
    employeeNo,
    transactionDate: { $lt: startDate },
    entryStatus: { $ne: "Deleted" },
  })
    .sort("transactionDate")
    .exec();

  openingTransactions.forEach((txn) => {
    const amount = parseFloat(txn.amount.toString());
    const code = txn.transactionCode;
    if (!(code in openingBalances)) {
      openingBalances[code] = 0;
    }

    // Special logic for transactionCode 4
    if (code === 4) {
      if (txn.flag === 1) {
        // Credit
        openingBalances[code] += amount;
      } else if (txn.flag === 2) {
        // Debit
        openingBalances[code] -= amount;
      }
    } else {
      if (txn.flag === 1) {
        // Debit
        openingBalances[code] -= amount;
      } else if (txn.flag === 2) {
        // Credit
        openingBalances[code] += amount;
      }
    }
  });

  // Apply opening balances
  TRANSACTION_CODES.forEach((code) => {
    balanceMap[code].openingBalance = openingBalances[code] || 0;

    if (balanceMap[code].debit === 0 && balanceMap[code].credit === 0) {
      balanceMap[code].closingBalance = balanceMap[code].openingBalance;
    }
  });

  // Process transactions in date range
  transactions.forEach((txn) => {
    const amount = parseFloat(txn.amount.toString());
    const code = txn.transactionCode;

    if (!(code in openingBalances)) {
      openingBalances[code] = balanceMap[code].openingBalance;
    }

    // Special logic for transactionCode 4
    if (code === 4) {
      if (txn.flag === 1) {
        // Credit
        balanceMap[code].credit += amount;
        openingBalances[code] += amount;
      } else if (txn.flag === 2) {
        // Debit
        balanceMap[code].debit += amount;
        openingBalances[code] -= amount;
      }
    } else {
      if (txn.flag === 1) {
        // Debit
        balanceMap[code].debit += amount;
        openingBalances[code] -= amount;
      } else if (txn.flag === 2) {
        // Credit
        balanceMap[code].credit += amount;
        openingBalances[code] += amount;
      }
    }

    balanceMap[code].closingBalance = openingBalances[code];
  });

  // Return the final result
  return [
    balanceMap[1],
    balanceMap[3],
    balanceMap[4],
    balanceMap[6] && {
      transactionCode: 6,
      closingBalance: balanceMap[6].closingBalance,
    },
    balanceMap[7] && {
      transactionCode: 7,
      closingBalance: balanceMap[7].closingBalance,
    },
  ].filter(Boolean);
}


// ✅ API: Employee summary with overall totals
router.get("/summary-sumtotal", async (req, res) => {
  try {
    const { employeeNo, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Convert dates to ISO format
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    let filter = {}; //{ transactionDate: { $gte: start, $lte: end } };
    if (employeeNo) filter.employeeNo = employeeNo;
    // Fetch all distinct employees (no pagination yet)
    const employees = await Transaction.distinct("employeeNo", filter);

    // ✅ Get summary for all employees first
    const allSummaries = await Promise.all(
      employees.map(async (empNo) => {
        const employee = await Employee.findOne({ employeeNo: empNo }).select(
          "name"
        );
        const employeeName = employee ? employee.name : "Unknown";

        return {
          employeeNo: empNo,
          employeeName,
          transactions: await getEmployeeSummary(empNo, start, end),
        };
      })
    );

    // ✅ Calculate Overall Totals across all employees
    const overallMap = {};

    allSummaries.forEach((empSummary) => {
      empSummary.transactions.forEach((txn) => {
        const code = txn.transactionCode;
        if (!overallMap[code]) {
          overallMap[code] = {
            transactionCode: code,
            openingBalance: 0,
            debit: 0,
            credit: 0,
            closingBalance: 0,
          };
        }
        overallMap[code].openingBalance += txn.openingBalance || 0;
        overallMap[code].debit += txn.debit || 0;
        overallMap[code].credit += txn.credit || 0;
        overallMap[code].closingBalance += txn.closingBalance || 0;
      });
    });

    const overall = Object.values(overallMap);

    // ✅ Now apply pagination to employees for response
    const paginatedEmployees = allSummaries.slice(
      (page - 1) * limit,
      page * limit
    );

    // ✅ Send response
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(employees.length / limit),
      overall,
      data: paginatedEmployees,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API Endpoint
router.get("/summary", async (req, res) => {
  try {
    const { employeeNo, startDate, endDate, page = 1, limit = 10 } = req.query;

    // Convert dates to ISO format
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    let filter = {}; //{ transactionDate: { $gte: start, $lte: end } };
    if (employeeNo) filter.employeeNo = employeeNo;
    // Get unique employee numbers for pagination
    const employees = await Transaction.distinct("employeeNo", filter);
    const paginatedEmployees = employees.slice(
      (page - 1) * limit,
      page * limit
    );

    // Fetch summaries for each employee
    const summaryData = await Promise.all(
      paginatedEmployees.map(async (empNo) => {
        // Fetch employee details
        const employee = await Employee.findOne({ employeeNo: empNo }).select(
          "name"
        );
        const employeeName = employee ? employee.name : "Unknown";

        return {
          employeeNo: empNo,
          employeeName,
          transactions: await getEmployeeSummary(empNo, start, end),
        };
      })
    );
    res.status(200).json({
      currentPage: parseInt(page),
      totalPages: Math.ceil(employees.length / limit),
      data: summaryData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/download-csv", async (req, res) => {
  try {
    const { employeeNo, startDate, endDate } = req.query;

    // Convert dates to ISO format
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    let filter = {}; //{ transactionDate: { $gte: start, $lte: end } };
    if (employeeNo) filter.employeeNo = employeeNo;

    // Get all unique employee numbers
    const employees = await Transaction.distinct("employeeNo", filter);

    // Fetch summaries for each employee without pagination
    const summaryData = await Promise.all(
      employees.map(async (empNo) => {
        // Fetch employee details
        const employee = await Employee.findOne({ employeeNo: empNo }).select(
          "name"
        );
        const employeeName = employee ? employee.name : "Unknown";

        return {
          employeeNo: empNo,
          employeeName,
          transactions: await getEmployeeSummary(empNo, start, end),
        };
      })
    );

    res.status(200).json({
      data: summaryData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/transaction-codewise-balance-1", async (req, res) => {
  try {
    const { startDate, endDate, transactionCode } = req.query;
    const filters = { entryStatus: { $ne: "Deleted" } };

    if (transactionCode) {
      filters.transactionCode = { $in: transactionCode.split(",").map(Number) };
    }

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchPeriod = { ...filters };
    if (start && end) {
      matchPeriod.transactionDate = { $gte: start, $lte: end };
    } else if (start) {
      matchPeriod.transactionDate = { $gte: start };
    } else if (end) {
      matchPeriod.transactionDate = { $lte: end };
    }

    const matchOpening = start
      ? {
          ...filters,
          transactionDate: { $lt: start },
        }
      : null;

    const pipeline = [
      {
        $facet: {
          // Opening balance before start date
          opening: matchOpening
            ? [
                { $match: matchOpening },
                {
                  $group: {
                    _id: null,
                    balance: {
                      $sum: {
                        $cond: [
                          { $eq: ["$flag", 1] },
                          "$amount",
                          { $multiply: ["$amount", -1] },
                        ],
                      },
                    },
                  },
                },
              ]
            : [],

          // Transaction breakdown in the given period
          breakdown: [
            { $match: matchPeriod },
            {
              $group: {
                _id: {
                  flag: "$flag",
                  entryType: "$entryType",
                },
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ];

    const result = await Transaction.aggregate(pipeline);

    const openingRaw = result[0].opening[0]?.balance || 0;
    const opening =
      typeof openingRaw === "number"
        ? openingRaw
        : parseFloat(openingRaw.toString());

    const breakdown = result[0].breakdown;

    let payment = 0;
    let recovery = 0;
    let otherPayment = 0;
    let otherRecovery = 0;

    for (const item of breakdown) {
      const { flag, entryType } = item._id;
      const total =
        typeof item.total === "number"
          ? item.total
          : parseFloat(item.total?.toString() || "0");

      if (entryType === "auto" && flag === 1) {
        payment += total;
      }
      if (entryType === "manual" && flag === 2) {
        recovery += total;
      }
      if (entryType === "manual" && flag === 1) {
        otherPayment += total;
      }
      if (entryType === "manual" && flag === 2) {
        otherRecovery += total;
      }
    }

    const closingBalance = (
      opening +
      payment +
      otherPayment -
      recovery -
      otherRecovery
    ).toFixed(2);

    res.status(200).json({
      openingBalance: opening.toFixed(2),
      payment: payment.toFixed(2),
      recovery: recovery.toFixed(2),
      otherPayment: otherPayment.toFixed(2),
      otherRecovery: otherRecovery.toFixed(2),
      closingBalance,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function parseDateString(dateStr) {
  // Match DD-MM-YYYY format
  const match = dateStr?.match(/^(\d{2})-(\d{2})-(\d{4})T(.+)$/);
  if (match) {
    const [_, day, month, year, time] = match;
    return new Date(`${year}-${month}-${day}T${time}`);
  }
  return new Date(dateStr); // fallback for ISO
}

router.get("/transaction-codewise-balance", async (req, res) => {
  try {
    const { startDate, endDate, transactionCode } = req.query;

    const filters = { entryStatus: { $ne: "Deleted" } };

    let transactionCodeArr = [];
    if (transactionCode) {
      transactionCodeArr = transactionCode.split(",").map(Number);
      filters.transactionCode = { $in: transactionCodeArr };
    } else {
      filters.transactionCode = { $in: [1, 3, 4, 5] };
    }

    const start = startDate ? parseDateString(startDate) : null;
    const end = endDate ? parseDateString(endDate) : null;

    const matchPeriod = { ...filters };

    if (start && end) {
      matchPeriod.transactionDate = { $gte: start, $lte: end };
    } else if (start) {
      matchPeriod.transactionDate = { $gte: start };
    } else if (end) {
      matchPeriod.transactionDate = { $lte: end };
    }

    const matchOpening = start
      ? {
          ...filters,
          transactionDate: { $lt: start },
        }
      : null;

    const customAmountExpr = {
      $cond: {
        if: { $in: ["$transactionCode", [4, 5]] },
        then: {
          $cond: [
            { $eq: ["$flag", 1] },
            "$amount",
            { $multiply: ["$amount", -1] },
          ],
        },
        else: {
          $cond: [
            { $eq: ["$flag", 2] },
            "$amount",
            { $multiply: ["$amount", -1] },
          ],
        },
      },
    };

    const pipeline = [
      {
        $facet: {
          opening: matchOpening
            ? [
                { $match: matchOpening },
                {
                  $group: {
                    _id: null,
                    balance: { $sum: customAmountExpr },
                  },
                },
              ]
            : [],

          breakdown: [
            { $match: matchPeriod },
            {
              $group: {
                _id: {
                  flag: "$flag",
                  entryType: "$entryType",
                },
                total: { $sum: customAmountExpr },
              },
            },
          ],
        },
      },
    ];

    const result = await Transaction.aggregate(pipeline);

    const openingRaw = result[0].opening[0]?.balance || 0;
    const opening =
      typeof openingRaw === "number"
        ? openingRaw
        : parseFloat(openingRaw.toString());

    const breakdown = result[0].breakdown;

    let payment = 0;
    let recovery = 0;
    let otherPayment = 0;
    let otherRecovery = 0;

    for (const item of breakdown) {
      const { flag, entryType } = item._id;
      const total =
        typeof item.total === "number"
          ? item.total
          : parseFloat(item.total?.toString() || "0");

      if (entryType === "auto" && flag === 1) payment += total;
      if (entryType === "auto" && flag === 2) recovery += total;
      if (entryType === "manual" && flag === 1) otherPayment += total;
      if (entryType === "manual" && flag === 2) otherRecovery += total;
    }

    const closingBalance = (
      opening +
      payment +
      recovery +
      otherPayment +
      otherRecovery
    ).toFixed(2);

    res.status(200).json({
      openingBalance: opening.toFixed(2),
      payment: payment.toFixed(2),
      recovery: recovery.toFixed(2),
      otherPayment: otherPayment.toFixed(2),
      otherRecovery: otherRecovery.toFixed(2),
      closingBalance,
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/transaction-list-codewise", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      transactionCode,
      page = 1,
      limit = 10,
      isDownload = false,
    } = req.query;

    const filters = { entryStatus: { $ne: "Deleted" } };

    let transactionCodeArr = [];
    if (transactionCode) {
      transactionCodeArr = transactionCode.split(",").map(Number);
      filters.transactionCode = { $in: transactionCodeArr };
    }

    // Query for list
    const listQuery = { ...filters };

    if (startDate && endDate) {
      listQuery.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      listQuery.transactionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      listQuery.transactionDate = { $lte: new Date(endDate) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let transactionsList = [];
    let totalCount = 0;

    if (isDownload === "true") {
      transactionsList = await Transaction.find(listQuery).sort({
        transactionDate: -1,
      });
      totalCount = transactionsList.length;
    } else {
      totalCount = await Transaction.countDocuments(listQuery);
      transactionsList = await Transaction.find(listQuery)
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.status(200).json({
      transactions: transactionsList,
      totalCount: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

import dayjs from "dayjs";

// Month ordering for financial year starting April
const monthOrder = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];

router.post("/generate-cd-interest", async (req, res) => {
  try {
    const { dryRun, employeeNo } = req.query; // 👈 can also read from req.body

    const cdRecoveries = await Transaction.find({
      transactionCode: 3,
      flag: 2,
      entryStatus: "Active",
    });
    const cdInterests = await Transaction.find({
      transactionCode: 6,
      flag: 2,
      entryStatus: "Active",
    });
    // 🔹 Limit employees if employeeNo is passed

    let employees;
    if (employeeNo) {
      employees = [parseInt(employeeNo)];
    } else {
      employees = [...new Set(cdRecoveries.map((t) => t.employeeNo))];
    }

    const results = [];
    for (let emp of employees) {
      const empRecoveries = cdRecoveries.filter((t) => t.employeeNo === emp);
      if (empRecoveries.length === 0) continue;
      
      const empInterests = cdInterests.filter((t) => t.employeeNo === emp);
      // Sort interests by FY order
      empInterests.sort(
        (a, b) =>
          monthOrder.indexOf(a.transactionMonth) -
          monthOrder.indexOf(b.transactionMonth)
      );

      let lastMonth, lastDate;
      if (empInterests.length > 0) {
        const lastTxn = empInterests[empInterests.length - 1];
        lastMonth = lastTxn.transactionMonth;
        lastDate = lastTxn.transactionDate;
      } else {
        // 🔹 No CD Interest entries, use first CD Recovery after 31-03-2024
        const cutoffDate = new Date("2024-03-31T00:00:00.000Z");
        const futureRecoveries = empRecoveries
          .filter((t) => new Date(t.transactionDate) > cutoffDate)
          .sort(
            (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
          );

        if (futureRecoveries.length > 0) {
          const firstRecovery = futureRecoveries[0];

          // 🔹 Calculate lastMonth as one month before firstRecovery.transactionMonth
          let prevMonth = firstRecovery.transactionMonth - 1;
          if (prevMonth === 0) prevMonth = 12; // wrap around if Jan → Dec

          lastMonth = prevMonth;

          // 🔹 Calculate lastDate as one month before firstRecovery.transactionDate
          const firstDate = new Date(firstRecovery.transactionDate);
          const prevDate = new Date(firstDate);
          prevDate.setMonth(firstDate.getMonth() - 1);

          lastDate = prevDate;
        } else {
          // 🔹 Fallback if no recovery exists after 31-03-2024
          const today = new Date();
          const fyStartYear =
            today.getMonth() < 3
              ? today.getFullYear() - 1
              : today.getFullYear();
          lastMonth = 2;
          lastDate = new Date(`2024-03-01`);
          //lastDate = new Date(`${fyStartYear}-03-01`);
        }
        
      }

      let filterDate = lastDate;

      // 🔹 If lastDate is 2024-03-01T00:00:00.000Z, use 2024-03-31T00:00:00.000Z instead
      const march1UTC = new Date("2024-03-01T00:00:00.000Z");
      if (lastDate.getTime() === march1UTC.getTime()) {
        filterDate = new Date("2024-03-31T00:00:00.000Z");
      }

      const newRecoveries = empRecoveries
        .filter((t) => new Date(t.transactionDate) > filterDate)
        .sort(
          (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
        );

      // for (let txn of newRecoveries) {
      //   const openingBalanceAgg = await Transaction.aggregate([
      //     {
      //       $match: {
      //         employeeNo: emp,
      //         transactionCode: 3,
      //         flag: 2,
      //         transactionDate: { $lte: txn.transactionDate },
      //       },
      //     },
      //     {
      //       $group: { _id: null, total: { $sum: { $toDecimal: "$amount" } } },
      //     },
      //   ]);

      //   const openingBalance = openingBalanceAgg[0]?.total || 0;
      //   const interest = (parseFloat(openingBalance) * 4.5) / 1200;
      //   const nextMonth = lastMonth === 12 ? 1 : lastMonth + 1;
      //   const nextDate = new Date(lastDate);
      //   nextDate.setMonth(nextDate.getMonth() + 1);
      //   console.log(
      //     "openingBalance:",
      //     openingBalance,
      //     "Interest:",
      //     interest,
      //     "NextMonth:",
      //     nextMonth,
      //     "NextDate:",
      //     nextDate
      //   );
      //   const newEntry = {
      //     employeeNo: emp,
      //     transactionMonth: nextMonth,
      //     transactionDate: nextDate,
      //     transactionCode: 6,
      //     flag: 2,
      //     amount: interest.toFixed(2),
      //     entryType: "auto",
      //     createdBy: "admin",
      //     entryStatus: "Active",
      //   };

      //   results.push(newEntry);

      //   if (!dryRun) {
      //     console.log(
      //       "Inserting interest for employee:",
      //       emp,
      //       "Amount:",
      //       interest.toFixed(2),
      //       "Date:",
      //       nextDate
      //     );
      //     await new Transaction({
      //       ...newEntry,
      //       amount: mongoose.Types.Decimal128.fromString(interest.toFixed(2)),
      //     }).save();
      //   }

      //   lastMonth = nextMonth;
      //   lastDate = nextDate;
      // }
      if (newRecoveries.length > 0) {
        // Case 1: Generate per recovery
        for (let txn of newRecoveries) {
          const openingBalanceAgg = await Transaction.aggregate([
            {
              $match: {
                employeeNo: emp,
                transactionCode: 3,
                flag: 2,
                transactionDate: { $lte: txn.transactionDate },
              },
            },
            {
              $group: { _id: null, total: { $sum: { $toDecimal: "$amount" } } },
            },
          ]);
      
          const openingBalance = openingBalanceAgg[0]?.total || 0;
          const interest = (parseFloat(openingBalance) * 4.5) / 1200;
          const nextMonth = lastMonth === 12 ? 1 : lastMonth + 1;
          const nextDate = new Date(lastDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
      
          console.log(
            "Emp:", emp,
            "openingBalance:", openingBalance,
            "Interest:", interest,
            "NextMonth:", nextMonth,
            "NextDate:", nextDate
          );
      
          const newEntry = {
            employeeNo: emp,
            transactionMonth: nextMonth,
            transactionDate: nextDate,
            transactionCode: 6,
            flag: 2,
            amount: interest.toFixed(2),
            entryType: "auto",
            createdBy: "admin",
            entryStatus: "Active",
          };
      
          results.push(newEntry);
      
          if (!dryRun) {
            await new Transaction({
              ...newEntry,
              amount: mongoose.Types.Decimal128.fromString(interest.toFixed(2)),
            }).save();
          }
      
          lastMonth = nextMonth;
          lastDate = nextDate;
        }
      } else {
        // Case 2: No recoveries → still accrue interest monthly
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JS months are 0-based
      
        // keep generating months until current month of current year
        while (
          lastDate.getFullYear() < currentYear ||
          (lastDate.getFullYear() === currentYear && lastMonth < currentMonth)
        ) {
          // increment month
          const nextDate = new Date(lastDate);
          nextDate.setMonth(nextDate.getMonth() + 1);
      
          const nextMonth = nextDate.getMonth() + 1; // 1–12
          const nextYear = nextDate.getFullYear();
      
          // aggregate opening balance up to this month
          const openingBalanceAgg = await Transaction.aggregate([
            {
              $match: {
                employeeNo: emp,
                transactionCode: 3,
                flag: 2,
                transactionDate: { $lte: nextDate },
              },
            },
            {
              $group: { _id: null, total: { $sum: { $toDecimal: "$amount" } } },
            },
          ]);
      
          const openingBalance = openingBalanceAgg[0]?.total || 0;

           // 🚨 Stop loop if balance ≤ 0
    if (parseFloat(openingBalance) <= 0) {
      console.log(
        "Emp:", emp,
        "No further interest accrual. OpeningBalance:", openingBalance,
        "NextDate:", nextDate
      );
      break;
    }
          const interest = (parseFloat(openingBalance) * 4.5) / 1200;
      
         
      
          const newEntry = {
            employeeNo: emp,
            transactionMonth: nextMonth,
            transactionDate: nextDate,
            transactionCode: 6,
            flag: 2,
            amount: interest.toFixed(2),
            entryType: "auto",
            createdBy: "admin",
            entryStatus: "Active",
          };
      
          results.push(newEntry);
      
          if (!dryRun) {
            await new Transaction({
              ...newEntry,
              amount: mongoose.Types.Decimal128.fromString(interest.toFixed(2)),
            }).save();
          }
      
          // update last pointers
          lastMonth = nextMonth;
          lastDate = nextDate;
        }
      }
      
      
    }

    res.json({
      message: dryRun
        ? `Dry run completed for ${
            employeeNo ? "employee " + employeeNo : "all employees"
          }.`
        : `CD Interest generated successfully for ${
            employeeNo ? "employee " + employeeNo : "all employees"
          }`,
      entries: results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/cd-interest-opening", async (req, res) => {
  try {
    const { employeeNo } = req.query;

    // Base filter
    const filter = {
      transactionCode: 3,
      flag: 2,
      entryStatus: "Active",
      transactionDate: { $lt: new Date("2024-03-31T18:30:00.000Z") },
    };
    if (employeeNo) {
      filter.employeeNo = Number(employeeNo);
    }

    // Get transactions matching
    const transactions = await Transaction.find(filter);

    if (!transactions.length) {
      return res
        .status(404)
        .json({ message: "No eligible transactions found." });
    }

    const txnDateUTC = new Date(Date.UTC(2024, 2, 1)); // year, monthIndex (0-based), day

    // Process each employee
    const inserts = [];

    for (const t of transactions) {
      const baseAmount = Number(t.amount);

      // Apply formula
      const calcAmount = (((baseAmount - 2400) * 12 + 15600) * 4.5) / 1200;

      const newTxn = new Transaction({
        employeeNo: t.employeeNo,
        transactionDate: txnDateUTC, //dayjs("2024-03-01").toDate(),
        transactionMonth: 2, // February
        transactionCode: 6, // CD Interest
        flag: 2,
        amount: calcAmount,
        entryType: "auto",
        entryStatus: "Active",
        createdBy: "admin",
      });
      inserts.push(newTxn.save());
    }

    const results = await Promise.all(inserts);

    res.json({
      message: `Inserted ${results.length} CD Interest records`,
      data: results,
    });
  } catch (err) {
    console.error("Error in calculate-cd-interest:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
