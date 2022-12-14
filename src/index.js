const express = require("express");
require("./db/mongoose");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 3000;
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

dotenv.config();
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
