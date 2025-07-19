const mongoose = require("mongoose");
const { Schema } = mongoose;

const model = require("../model/jobsModel");
const JobModel = model.jobModel;

// const model2 = require("../model/jobsModel");
// const JobRegistration = model2.JobApplicationRegistration;

const modelTwo = require("../model/UserRegisterForJob");
const JobRegistrationModel = modelTwo.JobApplicationRegistration;

// admin post the new job
exports.JobListing = async (req, res) => {
  try {
    const {
      companyName,
      jobRole,
      lastRegistrationDate,
      onlyApplyBranches,
      aboutCompany,
      requiredCGPA,
      requiredSkills,
      ctc,
      location,
      jobType,
    } = req.body;

    // Input validation
    if (
      !companyName ||
      !jobRole ||
      !lastRegistrationDate ||
      !onlyApplyBranches ||
      !aboutCompany ||
      !requiredCGPA ||
      !requiredSkills ||
      !ctc ||
      !location ||
      !jobType
    ) {
      return res.status(400).json({
        message: "Please fill all required fields properly.",
        success: false,
      });
    }

    // Create and save job
    const newJob = new JobModel({
      companyName,
      jobRole,
      lastRegistrationDate,
      onlyApplyBranches,
      aboutCompany,
      requiredCGPA,
      requiredSkills,
      ctc,
      location,
      jobType,
    });

    await newJob.save();

    res.status(201).json({
      message: "Job posted successfully",
      success: true,
      job: newJob,
    });

    // emit an event to the event bus
    // 4. Emit event to Event Bus
    try {
      console.log("Emitting SHOWJOBS event to event bus...");
      await fetch("http://localhost:4004/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            type: "POSTAJOB",
            data: {
              companyName : newJob.companyName,
              jobRole : newJob.jobRole,
              lastRegistrationDate : newJob.lastRegistrationDate,
              onlyApplyBranches : newJob.onlyApplyBranches,
              aboutCompany : newJob.aboutCompany,
              requiredCGPA : newJob.requiredCGPA,
              requiredSkills : newJob.requiredSkills,
              ctc : newJob.ctc,
              location : newJob.location,
              jobType : newJob.jobType,
            },
          },
        }),
      });
    } catch (eventError) {
      console.error("Error emitting to event bus:", eventError.message);
    }
  } catch (error) {
    console.error("Error while posting job:", error);
    res.status(500).json({
      message: "Error occurred while posting job",
      success: false,
    });
  }
};

// user register himself for that job
exports.UserRegisterForTheJob = async (req, res) => {
  try {
    // Got userId from auth middleware (req.user._id), jobId from frontend
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({
        message: "userId and jobId are required",
        success: false,
      });
    }

    // const alreadyApplied = await JobApplicationRegistration.find({ userId, jobId });
    // if (alreadyApplied) {
    //   return res.status(409).json({
    //     message: "User already applied for this job",
    //     success: false,
    //   });
    // }

    const applyForJob = new JobRegistrationModel({
      userId,
      jobId,
    });

    await applyForJob.save();

    return res.status(200).json({
      message: "User applied for job successfully",
      success: true,
      applyForJob,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};

exports.showAllJobs = async (req, res) => {
  try {
    const data = await JobModel.find();

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No jobs found.",
        success: false,
      });
    }

    res.status(200).json({
      message: "All jobs fetched successfully",
      success: true,
      data,
    });

    // 4. Emit event to Event Bus
    try {
      console.log("Emitting SHOWJOBS event to event bus...");
      await fetch("http://localhost:4004/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            type: "SHOWALLJOBS",
            DataTransferItem,
          },
        }),
      });
    } catch (eventError) {
      console.error("Error emitting to event bus:", eventError.message);
    }
  } catch (err) {
    // 5. Handle DB or server errors
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({
      message: "Server error while fetching jobs.",
      success: false,
    });
  }
};
