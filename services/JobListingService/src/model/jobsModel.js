const mongoose = require("mongoose");
const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    companyName: { type: String, required: true },
    jobRole: { type: String, required: true },
    lastRegistrationDate: { type: Date, required: true },
    onlyApplyBranches: {
      type: String,
      enum: ["AIML", "AIDS", "Cyber_Security", "CSE", "All_Branches"],
      default: "All_Branches",
    },
    aboutCompany: { type: String },
    requiredCGPA: { type: Number },
    requiredSkills: { type: String },
    ctc: { type: Number },
    location: { type: String },
    jobType: {
      type: String,
      enum: ["Internship", "FullTime"],
      default: "FullTime",
    },
    // postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

exports.jobModel = mongoose.model('jobModel' ,jobSchema )