import mongoose from "mongoose";

const ClubMembershipSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "left"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["Member", "Volunteer", "Event Organizer"],
      default: "Member",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Prevent duplicate memberships
ClubMembershipSchema.index({ club: 1, student: 1 }, { unique: true });

export default mongoose.models.ClubMembership ||
  mongoose.model("ClubMembership", ClubMembershipSchema);
