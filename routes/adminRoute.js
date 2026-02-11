import express from "express";
import AdminUser from '../models/AdminUserSchema.js'
import bcrypt from 'bcryptjs';
import  jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/users - Add a new user
router.post("/addusers", async (req, res) => {
    try {
      const {
        userId,
        password,
        name,
        role,
        status = "active",
        contactNumber,
        contactEmail,
        gender,
        address,
        addressState,
        pincode,
        photo,
      } = req.body;
      // Check if user already exists with the same schoolId and userId
      const existingUser = await AdminUser.findOne({ userId });
      
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User ID already exists for this school" });
      }
  
      // Encrypt password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create a new user
      const newUser = new AdminUser({
        schoolId,
        userId,
        password: hashedPassword,
        name,
        role,
        status,
        contactNumber,
        contactEmail,
        gender,
        address,
        addressState,
        pincode,
        country,
        photo,
      });
      console.log("here : ",newUser);
      await newUser.save();
  
      res.status(201).json({ message: "User added successfully", userId });
    } catch (error) {
      ("error",error);
      res.status(500).json({ error: error});
    }
  });

  // PUT /api/users/:id - Update an existing user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      password,
      name,
      role,
      status,
      contactNumber,
      contactEmail,
      gender,
      address,
      addressState,
      pincode,
      country,
      photo,
    } = req.body;

    // Find the user
    const user = await AdminUser.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields only if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (name) user.name = name;
    if (role) user.role = role;
    if (status) user.status = status;
    if (contactNumber) user.contactNumber = contactNumber;
    if (contactEmail) user.contactEmail = contactEmail;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (addressState) user.addressState = addressState;
    if (pincode) user.pincode = pincode;
    if (country) user.country = country;
    if (photo) user.photo = photo;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

  // Login route
router.post('/login', async (req, res) => {
    const { userId, password } = req.body;
console.log("idp:", userId,password);
    if (!userId || !password) {

        return res.status(400).json({ success: false, message: 'Missing credentials' });
    }

    try {
        // Find the admin by ID
        const admin = await AdminUser.findOne({ userId:userId });
        if (!admin||null) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Calculate expiration time until the end of the day
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        // Calculate the time difference in seconds
const expirationTimeInSeconds = Math.floor((endOfDay - now) / 1000);


        // Generate a token
        const token = jwt.sign({ id: admin._id, userId: admin.userId }, process.env.JWT_SECRET, {
            expiresIn: expirationTimeInSeconds,
        });

        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export const seedDefaultAdmin = async () => {
    try {
      const existingAdmin = await AdminUser.findOne({ userId: "admin" });
  
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin@123", 10);
  
        const newAdmin = new AdminUser({
          userId: "admin",
          password: hashedPassword,
          name : "Default Admin",
          role:"Super Admin",
          status:"Active",
        });
  
        await newAdmin.save();
        console.log("Default admin user created.");
      } else {
        console.log("Default admin user already exists.");
      }
    } catch (error) {
      console.error("Error creating default admin user:", error);
    }
  };

export default router;