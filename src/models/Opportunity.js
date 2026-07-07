import mongoose from "mongoose";

const OpportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "Placement",
        "Internship",
        "Workshop",
        "Hackathon",
        "Research",
        "Scholarship",
      ],
      required: true,
    },
    location: { type: String, default: "On-Campus" },
    salary: { type: String }, // e.g. "₹25 LPA" or "₹50,000/month" or "Unpaid"
    deadline: { type: Date, required: true },
    description: { type: String, required: true },
    eligibility: { type: String }, // e.g. "B.Tech CSE with 7.0+ CGPA"
    departments: [{ type: String }], // e.g. ["CSE", "IT"]
    applicants: { type: Number, default: 0 },
    selected: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "closed"], default: "active" },
    featured: { type: Boolean, default: false },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Opportunity ||
  mongoose.model("Opportunity", OpportunitySchema);
