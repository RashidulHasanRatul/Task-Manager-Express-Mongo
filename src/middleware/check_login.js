const jwt = require("jsonwebtoken");
const User = require("../models/user");
const check_login = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");


    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;
    const user = await User.findOne({
      _id: _id,
      "tokens.token": token,
    });
    req.user = user;
    req.username = user.name;
    req.userId = _id;
    req.token = token;
    next();
  } catch (e) {
    console.log(e);
    next("Authentication Failed!!!!");
  }
};

module.exports = check_login;
