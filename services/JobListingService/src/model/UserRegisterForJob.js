const mongoose = require("mongoose");
const {Schema} = mongoose;

const model = require('./UserModel');
const userModel = model.userModel;

const model2 = require('./jobsModel');
const jobModel = model2.jobModel;

const JobApplicationSchema = new Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "jobModel",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    required: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

exports.JobApplicationRegistration = mongoose.model('JobApplicationRegistration', JobApplicationSchema);
