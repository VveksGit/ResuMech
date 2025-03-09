// import mongoose from "mongoose";

// const resumeSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     resumeUrl: {
//       type: String,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "processed", "error"],
//       default: "pending",
//     },
//     keywords: {
//       type: [String],
//       default: [],
//     },
//     atsScore: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: null,
//     },
//     improvements: {
//       type: [String],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// export const Resume = mongoose.model("Resume", resumeSchema);
