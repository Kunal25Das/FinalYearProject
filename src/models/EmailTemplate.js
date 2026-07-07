import mongoose from "mongoose";

const EmailTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.EmailTemplate ||
  mongoose.model("EmailTemplate", EmailTemplateSchema);
