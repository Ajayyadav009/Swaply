const mongoose = require("mongoose");
const sessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      dafault: 60,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
        "reschduled",
      ],
      default: "pending",
    },
    roomId: {
      type: String,
    },
    notes: {
      type: String,
      default: "",
    },
    topicsCovered: [
      {
        type: String,
      },
    ],
    feedback: {
      teachingQuality: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      givenBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    actualStartTime: Date,
    actualEndTime: Date,
    cancelReason: String,
  },
  { timestamps: true },
);

sessionSchema.index({ teacher: 1, scheduledAt: -1 });
sessionSchema.index({ student: 1, scheduledAt: -1 });
module.exports = mongoose.model("Session", sessionSchema);
