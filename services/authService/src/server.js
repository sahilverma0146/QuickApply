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


const authController = require("./controller/userController");

app.post("/register", authController.Register);
app.post("/login", authController.Login);


// write the routes by which we gt  the events from the event bus 

app.post("/events", (req, res) => {
  const  event  = req.body;
  console.log("Event received by auth-service:", event);

  // You can handle specific events here
  // if (event.type === "UserUpdated") { ... }

  res.status(200).json({ message: "Event received by auth-service" });
});

const port = 4000;
app.listen(port, () => {
  console.log("the authservice is running at 4000");
});
