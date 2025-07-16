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


const authMiddleware = require("./middleware/authMiddleware");

// Protect a route using the auth middleware
app.get('/authMiddleware', authMiddleware.authMiddleware);

// Receive event from Event Bus
app.post("/events", (req, res) => {
  const { data } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log(" Event received at auth-middleware service:", data);
  console.log(" Token from header:", token);

  res.status(200).json({ message: "Event received" });
});

const port = 4002;
app.listen(port, () => {
  console.log("the authservice is running at 4002");
});
