const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Task = require("../models/task");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const check_login = require("../middleware/check_login");

// create task
router.post("/tasks", check_login, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      author: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// get all tasks
router.get("/tasks", check_login, async (req, res) => {
  try {
    const tasks = await Task.find({ author: req.user._id });
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// filtered tasks
router.get("/tasks", check_login, async (req, res) => {
  try {
    const tasks = await Task.find({ 
      path:'tasks',
      match: {
        completed: true,
      }
    });
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// get task by id
router.get("/tasks/:id", check_login, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ author: req.user._id });
    console.log(req.user._id);
    console.log(task);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

// update task by id
router.patch("/tasks/:id", check_login, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const task = await Task.findById({
      _id: req.params._id,
      author: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete task by id
router.delete("/tasks/:id", check_login, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({
      _id: req.params._id,
      author: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
