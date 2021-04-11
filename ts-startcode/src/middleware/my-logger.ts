import express from "express";
const app = express();

//Logger
export default app.use((req, res, next) => {
  console.log("Request made at: " + new Date());
  console.log("Request method: " + req.method);
  console.log("Request url: " + req.url);
  console.log("Remote ip: " + req.ip);
  next();
});
