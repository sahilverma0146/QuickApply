const express = require("express");
const app = express();

const mongoose = require("mongoose");

const cors = require("cors");

app.use(cors());
app.use(express.json());

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

// define all services wiil get the events from here

app.post("/events", async (req, res) => {
  const event  = req.body;
  const authHeader = req.headers.authorization || "";

  // emit event to auth service
  try {
    console.log(" Sending event to auth-service...");

    await fetch("http://localhost:4000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader, // optional if not used in auth-service
      },
      body: JSON.stringify(event), // ✅ wrap in { event } to match your service handler
    });

    console.log("✅ Event sent to auth-service");
  } catch (error) {
    console.error("❌ Failed to send event to auth-service:", error.message);
  }

  // emit event for auth middleware service
  try {
    console.log("📤 Sending event to authMiddleware...");
    await fetch("http://localhost:4002/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.log(error);
  }

  // emit event for job posting service
  try {
    console.log("📤 Sending event to job-post-service...");
    await fetch("http://localhost:4001/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: authHeader,
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.log(error);
  }

  
  return res.status(200).json({
    success: true,
    message: "Event sent to all services",
  });
});

const port = 4004;
app.listen(port, () => {
  console.log("job listing service was successfully running on 4004");
});
