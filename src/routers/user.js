const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const check_login = require("../middleware/check_login");
const multer = require("multer");
// signup
router.post("/users", async (req, res) => {
  try {
    const oldUser = await User.findOne({ email: req.body.email });
    if (oldUser) {
      return res.status(400).send({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 8);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).send("User created");
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

const upload = multer({
  dest: "./avatars",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  upload.single("test"),
  check_login,

  (req, res) => {
    try {
      res.send("uploaded");
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Unable to login");
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (isMatch) {
      // generate token
      const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        {
          expiresIn: "7 days",
        }
      );
      user.tokens = user.tokens.concat({ token });
      await user.save();

      res.send({
        user: user,
        token: token,
        message: "Login successful",
      });
    } else {
      return res.status(400).send("Unable to login");
    }
  } catch (e) {
    res.status(400).send({ error: "Authentication Failed" });
  }
});

// profile
router.get("/users/profile", check_login, async (req, res) => {
  res.send(req.user);
});

// logout
router.post("/users/logout", check_login, async (req, res) => {
  console.log(req.user);
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("Logout successful");
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});
// logout all
router.post("/users/logoutAll", check_login, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Logout ALL successful");
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

// get all user
router.get("/users", check_login, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(500).send(e);
  }
});

// update user
router.patch("/users/me", check_login, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// delete user
router.delete("/users/me", check_login, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
