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
app.get("/authMiddleware", authMiddleware.authMiddleware);

// Receive event from Event Bus
app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  console.log("Event received at auth-middleware service:", data);
  console.log("Token from header:", token);

  if (type === "USERCREATED") {
    try {
      // Decode token
      const decoded = jwt.verify(token, "shhhhh");
      console.log("Decoded Token:", decoded);

      // Send decoded data as a new event
      await fetch("http://localhost:4004/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TOKENDECODED",
          event: {
            data: {
              // userId: decoded.id,
              // email: decoded.email,
              role: decoded.role,
            },
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
