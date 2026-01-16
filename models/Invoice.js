const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    Studentid: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Student',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
