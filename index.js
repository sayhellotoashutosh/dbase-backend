
import express  from "express";
import bodyParser  from "body-parser";
import cors  from "cors";
import employeeRoute  from "./routes/employeeRoute.js";
import transactionRoute  from "./routes/transactionRoute.js";
import reportRoute  from "./routes/reportRoute.js";
import mongoose from "mongoose";
import adminRoute,{seedDefaultAdmin} from './routes/adminRoute.js'
//9670525324
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());


mongoose.connect('mongodb://admin:admin@48.217.86.238:27017/testapi?directConnection=true&appName=mongosh+2.3.1', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log(error));


// Routes
app.use("/api/employees", employeeRoute);
app.use("/api/adminuser", adminRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/report", reportRoute);

// Start the server

await seedDefaultAdmin();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
