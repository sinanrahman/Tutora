const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId:{
      type:String,
      unique:true
    },
    transactionType: {
      type: String,
      required: true,
      enum: ["CREDIT", "DEBIT"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
transactionSchema.pre('save', async function () {
    if (!this.transactionId) {
        const lastDoc = await this.constructor.findOne({ transactionId: { $exists: true } }).sort({ transactionId: -1 });
        let nextNum = 1;
        
        if (lastDoc && lastDoc.transactionId) {
            const lastIdNum = parseInt(lastDoc.transactionId.replace('TXN_', ''), 10);
            nextNum = lastIdNum + 1;
        }

        this.transactionId = `TXN_${nextNum.toString().padStart(3, '0')}`;
    }
});
module.exports = mongoose.model("Transaction", transactionSchema);
