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

    // Call the original end method
    originalEnd.apply(this, args);
  };

  next();
});

// Mongoose Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
  res.json(Person);
});

// Server Startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `server is Running on Port : ${process.env.PORT} \nURL : http://localhost:${process.env.PORT}/api/fake-person?count=1`
  );
});
