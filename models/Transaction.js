const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        creditor:{
            type:String,
            required:true,
        },
        debtor:{
            type:String,
            required:true,
        },
        amount:{
            type:Number,
            required:true,
            min:0
        },
        transactionCategory:{
            type:String,
            required:true,
        },
        transactionDescription:{
            type:String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
