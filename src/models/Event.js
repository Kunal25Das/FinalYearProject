import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["Academic", "Exam", "Sports", "Holiday", "Event"],
      default: "Academic",
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
