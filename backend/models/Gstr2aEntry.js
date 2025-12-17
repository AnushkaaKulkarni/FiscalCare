import mongoose from "mongoose";

const gstr2aEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    supplierGSTIN: {
      type: String,
      required: true
    },

    supplierName: {
      type: String
    },

    invoiceNumber: {
      type: String,
      required: true
    },

    invoiceDate: {
      type: Date,
      required: true
    },

    taxableValue: {
      type: Number,
      required: true
    },

    cgst: Number,
    sgst: Number,
    igst: Number,

    totalGST: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Gstr2aEntry", gstr2aEntrySchema);
