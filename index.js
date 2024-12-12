const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
app.use(cors({ origin: "*" }));

const { faker } = require("@faker-js/faker");
const MONGO_URI = process.env.MONGO_URI;
console.log(MONGO_URI);

// DB Schema

// DB COnnection
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    retryWrites: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    console.log(`Database Details:
    Host: ${mongoose.connection.host}
    Port: ${mongoose.connection.port}
    Database Name: ${mongoose.connection.name}`);
  })
  .catch((error) => {
    console.error("Error Occured", error);
  });
app.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
  console.log(
    `server is Running on Port : ${process.env.PORT} \nURL : http://localhost:${process.env.PORT}/api/fake-person?count=1`
  );
});
const LogSchema = new mongoose.Schema({
  origin: String,
  endpoint: String,
  timestamp: { type: Date, default: Date.now },
  port: Number,
  status: Number,
});
const Log = mongoose.model("Log", LogSchema);
app.use(async (req, res, next) => {
  // Capture response status after request is handled
  res.on("finish", async () => {
    const logEntry = {
      origin: req.ip,
      endpoint: req.originalUrl,
      timestamp: new Date(),
      port: process.env.PORT,
      status: res.statusCode, // Capture the status code
    };

    try {
      await Log.create(logEntry); // Save log to the database
      console.log(`Logged API Call: ${JSON.stringify(logEntry)}`); // Log to console
    } catch (error) {
      console.error("Error logging API call:", error);
    }
  });

  next(); // Proceed to next middleware or route
});
app.get("/", (req, res) => {
  res.json({
    mesaage: "welcome to my  Page",
    about: "This is a simple homepage served via an API.",
    links: {
      about: "/about",
      services: "/services",
      contact: "/contact",
    },
  });
});

app.get("/api/fake-person", (req, res) => {
  console.log("Request received for /api/fake-person");
  const count = parseInt(req.query.count) || 1;
  const Person = Array.from({ length: count }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
    },
    dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
    avatar: faker.image.avatar(),
  }));
  console.log("Sending response:", Person);
  res.json(Person);
});
