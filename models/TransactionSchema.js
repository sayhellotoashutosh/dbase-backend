import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  employeeNo: {
    type: Number,
    required: true,
  },
  transactionDate: {
    type: Date,
    required: true,
    
  },
  transactionMonth:{
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 
  },
  transactionCode: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6, 7], // 1: Sh. Money, 2: F.D., 3: C.D., 4: Loan, 5: Loan Intt., 6:CD Intt., 7 Dividend
  },
  flag: {
    type: Number,
    required: true,
    enum: [1, 2], // 1: Payment, 2: Recovery
  },
  amount:{
    type: mongoose.Types.Decimal128,
    required: true,
    default: 0.0,
    
  },
  entryType:{
    type:String,
    required:true,
    enum:["manual","auto"],
  },
  createdBy:{
    type:String,required:true,
  },
  security1:{type: Number,
    },
  security2:{type: Number,
    },
  entryStatus:{
    type:String,
    default:"Active",
  }
},{timestamps:true});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
