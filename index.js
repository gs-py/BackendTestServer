const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors({ origin: "*" }));

const { faker } = require("@faker-js/faker");

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
  console.log(
    `server is Running on Port : ${process.env.PORT} \nURL : http://localhost:${process.env.PORT}/api/fake-person?count=1`
  );
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
