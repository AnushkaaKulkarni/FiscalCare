// backend/models/Invoice.js
import mongoose from "mongoose";

const LineItemSchema = new mongoose.Schema({
  description: { type: String },
  hsn: { type: String },
  qty: { type: Number },
  unitPrice: { type: Number },
  taxableValue: { type: Number },
  taxPercent: { type: Number }, // e.g., 18
  taxAmount: { type: Number },  // tax for this line
});

const InvoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  fileName: { type: String },
  filePath: { type: String },
  rawText: { type: String },
  parsedAt: { type: Date, default: Date.now },

  vendor: { type: String },
  invoiceNo: { type: String },
  date: { type: String },          // raw extracted string like "13/11/2025"
  invoiceDate: { type: Date },     // normalized Date for month-wise GST
  gstin: { type: String },

  totalInvoice: { type: Number, default: 0 },
  totalInvoiceDisplay: { type: String },

  gstRateInvoice: { type: Number, default: 0 },
  gstAmountInvoice: { type: Number, default: 0 },
  cgstInvoice: { type: Number },
  sgstInvoice: { type: Number },
  igstInvoice: { type: Number },

  product: { type: String },
  hsn: { type: String },
  lineItems: [LineItemSchema],

  verifiedRate: { type: Number },
  gstRateAdjusted: { type: Number },
  totalGstAdjusted: { type: Number, default: 0 },
  taxableValue: { type: Number, default: 0 },
  cgstAdjusted: { type: Number },
  sgstAdjusted: { type: Number },
  igstAdjusted: { type: Number },

  gstVerified: { type: Boolean, default: false },
  verificationMessage: { type: String },
  parseWarnings: { type: [String], default: [] },

  reviewed: { type: Boolean, default: false },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  reviewDecision: {
    type: String,
    enum: ["accept_invoice","accept_adjusted","manual_edit","pending"],
    
    default: "pending"
  }, 
  reviewNotes: { type: String },

  invoiceType: {
  type: String,
  enum: ["B2B", "B2C", "EXPORT", "VOICE", "UNKNOWN"],
  default: "UNKNOWN"
},

transactionType: {
  type: String,
  enum: ["SALE", "PURCHASE", "UNKNOWN"],
  default: "UNKNOWN"
},

supplierGSTIN: { type: String },
buyerGSTIN: { type: String },

  confidenceScore: { type: Number, default: 0 },
  tags: { type: [String], default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InvoiceSchema.index({ invoiceNo: 1, gstin: 1 });
InvoiceSchema.index({ createdAt: -1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
