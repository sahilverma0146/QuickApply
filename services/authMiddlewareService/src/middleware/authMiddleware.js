const jwt = require("jsonwebtoken");

exports.authMiddleware = async (req, res , next) => {
  try {
    const authHeader = req.headers.authorization; // this is a string bearer toekn

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token found", success: false });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "shhhhh");
    console.log("the decoded user is ", decoded);
    req.user = decoded;

    next();


    // emit an event
    console.log("going to emit");
    await fetch("http://localhost:4004/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event: {
          type: "userDetailsFetched",
          data: {
            userId: decoded._id,
            email: decoded.email,
            role: decoded.role,
          },
        },
      }),
    });
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};
