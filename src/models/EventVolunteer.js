import mongoose from "mongoose";

const EventVolunteerSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClubEvent",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      default: "Volunteer",
    },
    tasks: [{ type: String }],
    coinsEarned: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.EventVolunteer ||
  mongoose.model("EventVolunteer", EventVolunteerSchema);
