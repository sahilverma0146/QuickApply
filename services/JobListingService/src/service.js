const express = require("express");
const app = express();

const mongoose = require("mongoose");

const cors = require("cors");
app.use(express.json());

app.use(cors());

// mongoose connection
try {
  main().catch((err) => console.log(err));

  async function main() {
    await mongoose.connect(
      "mongodb+srv://sahilverma22146:PSB3srMC5k6oFigi@cluster0.76mtdif.mongodb.net/"
    );

    console.log("mongoose connected successfully");
  }
} catch (error) {
  console.log(error);
}

const jobController = require("./controller/JobController");

app.post("/JobListing", jobController.JobListing);
app.post("/UserRegisterForTheJob", jobController.UserRegisterForTheJob);
app.get("/listalljobd", jobController.showAllJobs);

// capture the event from event bus
app.post("/events", (req, res) => {
  const { type, data } = req.body;

  console.log("Event Type:", type);
  console.log("Event Data:", data);

  if (type === "POSTAJOB") {
    console.log("Inside POSTAJOB handler");
    // Handle job post event
  }

  if (type === "TOKENDECODED") {
    console.log("Inside TOKENDECODED handler");
    console.log("Decoded Token Role:", data?.role);
    // You can handle decoded token logic here
  }

  res.send({});
});



const port = 4001;
app.listen(port, () => {
  console.log("job listing service was successfully running on 4001");
});
