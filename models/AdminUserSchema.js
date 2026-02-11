import  mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
  },
  contactEmail: {
    type: String,
  },

  gender: {
    type: String,
  },
  address: {
    type: String,
  },
  addressState: {
    type: String,
  },
  pincode: {
    type: String,
  },
  photo: {
    type: String,
  },
},{timestamps:true});

const AdminUser = mongoose.model("test_adminuser_sr01", adminUserSchema);

export default AdminUser;
