import mongoose from "mongoose";

// Job Posting Schema
const jobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

// Resume Schema
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    job_titles: {
      type: [String],
    },
    locations: {
      type: [String],
    },
    jobs: {
      type: mongoose.Schema.Types.Mixed, // Use Mixed type for flexible nested object
      default: {},
    },
  },
  {
    timestamps: true,
    strict: false, // Allow additional fields
  }
);

export const Resume = mongoose.model("Resume", resumeSchema);
