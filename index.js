const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
app.use(cors());

const MongoURI = process.env.MONGO_URL;
console.log(MongoURI);
mongoose
  .connect(MongoURI)
  .then((connection) => {
    console.log("db Connect successfully");
    console.log(`MongoDB connected: ${connection.connection.host}`);
  })
  .catch((error) => {
    console.error("connection failed", error.message);
  });

//   moongo database Scheme
const userSchema = new mongoose.Schema({
  name: String,
  age: {
    type: String,
    required: true,
  },
});

const userDetails = mongoose.model("Clientdetails", userSchema);

// api call to add datato database
app.get("/app/:name/:age", async (req, res) => {
  const name = req.params.name;
  const age = req.params.age;

  const newuser = userDetails({
    name: name,
    age: age,
  });

  await newuser
    .save()
    .then(() => {
      console.log("added to DB");
    })
    .catch((error) => {
      console.error("Error saving user:", error.message);
    });

  const savedUser = await userDetails.findById(newuser._id);

  resData = {
    Message: "this is from thsi .get ",
    status: 200,
    data: {
      id: savedUser._id,
      name: savedUser.name,
      age: savedUser.age,
    },
  };
  res.status(202).json(resData);
});

app.listen(3000, () => {
  console.log("server is Running on Port 3000");
});
