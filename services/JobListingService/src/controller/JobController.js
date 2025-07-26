const mongoose = require("mongoose");

const model = require("../model/jobsModel");
const JobModel = model.jobModel;

const modelTwo = require("../model/UserRegisterForJob");
const JobRegistrationModel = modelTwo.JobApplicationRegistration;

// post the new job
exports.JobListing = async (req, res) => {
  try {
    // get the director id from the middleware
    const directorId = req.id;
    const {
      companyName,
      jobRole,
      aboutCompany,
      requiredCGPA,
      requiredSkills,
      ctc,
      location,
      // jobType,
    } = req.body;

    // Input validation
    if (
      !companyName ||
      !jobRole ||
      !aboutCompany ||
      !requiredCGPA ||
      !requiredSkills ||
      !ctc ||
      !location
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
      aboutCompany,
      requiredCGPA,
      requiredSkills,
      ctc,
      location,
      postedBy: directorId,
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
          type: "POSTAJOB",
          data: {
            companyName: newJob.companyName,
            jobRole: newJob.jobRole,
            lastRegistrationDate: newJob.lastRegistrationDate,
            onlyApplyBranches: newJob.onlyApplyBranches,
            aboutCompany: newJob.aboutCompany,
            requiredCGPA: newJob.requiredCGPA,
            requiredSkills: newJob.requiredSkills,
            ctc: newJob.ctc,
            location: newJob.location,
            jobType: newJob.jobType,
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
    const id = req.id; // user ID set from auth middleware
    const { jobId } = req.body;

    if (!id || !jobId) {
      return res
        .status(400)
        .json({ message: "userId and jobId are required", success: false });
    }

    const alreadyApplied = await JobRegistrationModel.findOne({
      userId: id,
      jobId,
    });

    if (alreadyApplied) {
      return res.status(200).json({
        message: "You have already applied for this job.",
        success: false,
      });
    }

    const applyForJob = new JobRegistrationModel({
      userId: id,
      jobId,
    });

    await applyForJob.save();

    return res.status(200).json({
      message: "Applied for this job successfully",
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

// work done for this service
exports.showAllJobs = async (req, res) => {
  try {
    const data = await JobModel.find();

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "No jobs found.",
        success: false,
        data: [],
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
          type: "SHOWALLJOBS",
          data,
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

// route to delete a particular job
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const role = req.role;

    if (role === "director") {
      const deletedJob = await JobModel.findByIdAndDelete(jobId);

      if (!deletedJob) {
        return res
          .status(404)
          .json({ message: "No job found for this ID", success: false });
      }

      return res.status(200).json({
        message: "Job deleted successfully",
        success: true,
        deletedJob,
      });
    }

    res
      .status(404)
      .json({ message: "you are not specified for deleteing the job" });

    // cosnt {id} = req.params  this is destructuring the id from the req.params
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", success: false, error: error.message });
  }
};

// updating the particular job
exports.updateJob = async (req, res) => {
  const jobId = req.params.id;
  const role = req.role;
  const data = req.body; // here data becomes an object

  if (role === "director") {
    const updateJob = await JobModel.findByIdAndUpdate(jobId, { $set: data });
    if (!updateJob) {
      return res.status(404).json({ message: "jobUpdatation failed" });
    }
    res.status(200).json({ message: "job Updated Successfully" });
  }
};

// finding all the users which applied for the job
exports.fetchAllRegisteredUsers = async (req, res) => {
  const jobId = req.params.jobId;

  // token
  const role = req.role;
  if (role === "director") {
    const appliedUsers = await JobRegistrationModel.find({ jobId: jobId });
    if (!appliedUsers) {
      return res
        .status(200)
        .json({ message: "n one applied fro this job", success: true });
    }

    res
      .status(200)
      .json({ message: "the list of users are", success: true, appliedUsers });
  } else {
    res.status(404).json({ message: "You are not able to get the data" });
  }
};

// fetch all applied jobs irectly
exports.fetchAllAppliedJobsOfAParticularUser = async (req, res) => {
  const id = req.id; //USER ID
  const jobId = "687e6d1fa0f8cafed1f65eda";

  const jobs = await JobRegistrationModel.find({ userId: id }).populate(
    "jobId"
  );
  if (!jobs) {
    return res
      .status(404)
      .json({
        message: "no jobs applied by this user",
        success: false,
        data: [],
      });
  }
  res
    .status(200)
    .json({ message: "the applied jobs are", success: true, jobs });
};

// work done for this service
exports.showJobsForAdmin = async (req, res) => {
  try {
    const directorId = req.id;
    const data = await JobModel.find({ postedBy: directorId });

    if (!data || data.length === 0) {
      return res.status(200).json({
        message: "No jobs found.",
        success: false,
        data: [],
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
          type: "SHOWALLJOBS",
          data,
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
