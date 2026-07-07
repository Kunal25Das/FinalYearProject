import mongoose from "mongoose";

const ApprovalRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["club-admin", "event-organizer"],
      required: true,
    },
    typeName: { type: String, required: true }, // e.g. "Club Admin" or "Event Organizer"
    name: { type: String, required: true }, // Name of the proposed club or event
    description: { type: String, required: true },
    requestedBy: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    department: { type: String },
    batch: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: { type: String },
    documents: [{ type: String }], // Array of document links
    additionalInfo: { type: String },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.ApprovalRequest ||
  mongoose.model("ApprovalRequest", ApprovalRequestSchema);
