const express = require("express");

// create a reverse proxy
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// for authMiddleware
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:4002",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "",
    },
  })
);

// for Auth Service
app.use(
  "/userAuth",
  createProxyMiddleware({
    target: "http://localhost:5000", //userService
    changeOrigin: true,
    pathRewrite: {
      "^/userAuth": "", // /auth/login → /login
    },
  })
);

// for job service
app.use(
  "/Job",
  createProxyMiddleware({
    target: "http://localhost:4001", //jobService
    changeOrigin: true,
    pathRewrite: {
      "^/Job": "",
    },
  })
);

// for event service
app.use(
  "/eventBus",
  createProxyMiddleware({
    target: "http://localhost:4004",
    changeOrigin: true,
    pathRewrite: {
      "^/eventBus": "",
    },
  })
);


app.listen(3000, () => {
  console.log("api gateway successfully running at 3000");
});
