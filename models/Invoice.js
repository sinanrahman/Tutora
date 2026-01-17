const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    studentId: {
      type: String
    },
    amount: {
      type: Number,
      required: true,
    },
    item: {
      type: [{
        type: {
          type:String,
        },
        amount:{
          type:Number
        }
      }]
    },
    description: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now()
    },
    paid: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
