import express from "express";
import Employee from '../models/EmployeeSchema.js'


const router = express.Router();

// Add employee
router.post("/add", async (req, res) => {
  const { name, fatherHusband, zone } = req.body;
console.log("hit");
  if (!name || !fatherHusband || !zone) {
    return res.status(400).json({ error: "All fields are required except employeeNo." });
  }

  try {
    // Find the last employee by employeeNo in descending order
    const lastEmployee = await Employee.findOne().sort({ employeeNo: -1 });

    // Generate the new employee number
    const newEmployeeNo = lastEmployee ? lastEmployee.employeeNo + 1 : 1;

    // Create a new employee
    const newEmployee = new Employee({
      employeeNo: newEmployeeNo,
      name,
      fatherHusband,
      zone: parseInt(zone,10),
      employeeStatus: "Active", // Default value
    });

    // Save to the database
    const result = await newEmployee.save();

    res.status(201).json({ message: "Employee added successfully", result });
  } catch (error) {
    console.log("Error",error);
    console.error(error);
    res.status(500).json({ error: "Unable to add employee." });
  }
});

// Add employee
router.post("/employee-bulk-upload", async (req, res) => {
  const { employeeNo,name, fatherHusband, zone } = req.body;
console.log("hit");
  if (!name || !fatherHusband || !zone) {
    return res.status(400).json({ error: "All fields are required except employeeNo." });
  }

  try {
   
    // Create a new employee
    const newEmployee = new Employee({
      employeeNo: employeeNo,
      name,
      fatherHusband,
      zone: parseInt(zone,10),
      employeeStatus: "Active", // Default value
    });

    // Save to the database
    const result = await newEmployee.save();

    res.status(201).json({ message: "Employee added successfully", result });
  } catch (error) {
    console.log("Error",error);
    console.error(error);
    res.status(500).json({ error: "Unable to add employee." });
  }
});

// Update an employee
router.post("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, fatherHusband, zone, employeeStatus } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  try {
    // Check if the employee exists
    const existingEmployee = await Employee.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Update fields only if provided in request
    const updatedData = {};
    if (name) updatedData.name = name;
    if (fatherHusband) updatedData.fatherHusband = fatherHusband;
    if (zone !== undefined) updatedData.zone = parseInt(zone, 10);
    if (employeeStatus) updatedData.employeeStatus = employeeStatus;

    // Update the employee record
    const updatedEmployee = await Employee.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true, // Ensure validation rules are enforced
    });

    res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// List employees with pagination and search
router.get("/list", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  let searchQuery = {};

  if (search.trim() !== "") {
    searchQuery = isNaN(Number(search))
      ? { name: { $regex: search, $options: "i" } } // Search by name
      : { employeeNo: Number(search) }; // Search by number
  }

  try {
    const employees = await Employee.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Employee.countDocuments(searchQuery);

    res.status(200).json({
      employees,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// List employees with pagination and search
router.get("/:employeeNo", async (req, res) => {
  const employeeNo = parseInt(req.params.employeeNo, 10); // Parse to number

  if (isNaN(employeeNo)) {
    return res.status(400).json({ message: "Invalid employee number" });
  }

  try {
    const employee = await Employee.findOne({ employeeNo }); // Query with a number
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json({ employee });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;
