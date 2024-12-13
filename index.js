const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
app.use(cors({ origin: "*" }));

const { faker } = require("@faker-js/faker");
const MONGO_URI = process.env.MONGO_URI;

// Simplified Log Schema
const LogSchema = new mongoose.Schema({
  origin: String,
  endpoint: String,
  timestamp: {
    type: Date,
    default: () => {
      // Convert UTC to IST by adding 5 hours and 30 minutes
      const now = new Date();
      return new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    },
  },
  status: Number,
});
const Log = mongoose.model("Log", LogSchema);

// Simplified Logging Middleware
app.use((req, res, next) => {
  const originalEnd = res.end;

  res.end = function (...args) {
    // Create log entry
    const logEntry = {
      origin: req.ip || "unknown",
      endpoint: req.originalUrl,
      status: res.statusCode,
    };

    // Try to log without blocking
    Log.create(logEntry).catch((err) => {
      console.error("Logging failed:", err);
    });
    console.log(`req Header${req.headers.host}`);
    // Call the original end method
    originalEnd.apply(this, args);
  };

  next();
});

// Mongoose Connection
mongoose
  .connect(MONGO_URI, {
    // Remove retryWrites option
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Reduced timeout
    socketTimeoutMS: 45000, // Keep socket timeout
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB Connection Error:", error));

// Routes remain the same as in your original code
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to my Page",
    about: "This is a simple homepage served via an API.",
    links: {
      about: "/about",
      services: "/services",
      contact: "/contact",
    },
  });
});

app.get("/api/fake-person", (req, res) => {
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
  console.log(`API Req \nCount : ${count}`);
  res.json(Person);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});
