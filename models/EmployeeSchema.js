import  mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  employeeNo: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  fatherHusband: {
    type: String,
    required: true,
  },
  zone: {
    type: Number,
    required: true,
  },
  employeeStatus:{type:String,default:"Active"},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Employee = mongoose.model("test_employee_sr01", employeeSchema);

export default Employee;
