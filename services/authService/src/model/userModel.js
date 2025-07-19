const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema(
  {
    userName: {
      firstName: { type: String, required: true },
      lastName: { type: String },
    },
    email: { type: String, required: true},
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "director"],
      required: true,
    },
    token : {type:String},
    registeredJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

exports.userModel = mongoose.model('userModel' , UserSchema)