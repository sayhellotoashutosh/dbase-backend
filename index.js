import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import employeeRoute from "./routes/employeeRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import reportRoute from "./routes/reportRoute.js";
import adminRoute, { seedDefaultAdmin } from "./routes/adminRoute.js";

dotenv.config();

const app = express();

/* =======================
   Middleware
======================= */
app.use(bodyParser.json());
app.use(cors());

/* =======================
   MongoDB Connection
======================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* =======================
   Routes
======================= */
app.use("/api/employees", employeeRoute);
app.use("/api/adminuser", adminRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/report", reportRoute);

/* =======================
   Server Start
======================= */
const startServer = async () => {
  try {
    await seedDefaultAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Server startup error:", err);
  }
};

startServer();
