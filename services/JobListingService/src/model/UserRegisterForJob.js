const mongoose = require("mongoose");
const {Schema} = mongoose;


const JobApplicationSchema = new Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "jobModel",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

exports.JobApplicationRegistration = mongoose.model('JobApplicationRegistration', JobApplicationSchema);
