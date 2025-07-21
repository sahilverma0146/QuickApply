const express = require("express");
const app = express();
var jwt = require("jsonwebtoken");

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
// app.get("/authMiddleware", authMiddleware.authMiddleware);



app.get("/authMiddleware", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "shhhhh"); // Replace with your secret
    return res.status(200).json({
      success: true,
      user: decoded,
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Receive event from Event Bus
app.post("/events", async (req, res) => {
  const { type, data } = req.body;
    console.log("the data received from the event bus ", type);

  console.log("the data received from the event bus ", data);

  if (type === "USERCREATED") {
    try {
      // Decode token
      const decoded = jwt.verify(data.token, "shhhhh");
      console.log("Decoded Token:", decoded);

      // Send decoded data as a new event
      await fetch("http://localhost:4004/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TOKENDECODED",

          data: {
            // userId: decoded.id,
            // email: decoded.email,
            role: decoded.role,
          },
        }),
      });

      console.log("TokenDecoded event sent");
    } catch (err) {
      console.error("Invalid token", err);
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  if (type === "USERLOGGEDIN") {
    try {
      // Decode token
      const decoded = jwt.verify(data.token, "shhhhh");
      console.log("Decoded Token:", decoded);

      // Send decoded data as a new event
      await fetch("http://localhost:4004/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TOKENDECODED",

          data: {
            // userId: decoded.id,
            // email: decoded.email,
            role: decoded.role,
          },
        }),
      });

      console.log("TokenDecoded event sent");
    } catch (err) {
      console.error("Invalid token", err);
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  res.status(200).json({ message: "Event received" });
});

const port = 4002;
app.listen(port, () => {
  console.log("the authservice is running at 4002");
});
