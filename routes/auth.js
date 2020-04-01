const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const router = express.Router();

// @route  /api/auth
// @desc   GET logged in user
// @access Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user: user });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: "server error" });
  }
});

// @route /api/auth
// @desc Auth user & get token
// @access Public

router.post(
  "/",
  [
    check("email", "invalid email").isEmail(),
    check("password", "min length of password should be 4").isLength({ min: 4 })
  ],
  async (req, res) => {
    // destructring the req.body
    const { email, password } = req.body;
    // check for the errors valid data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }
    //search for the user in database
    try {
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ msg: "invalid credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "invalid credentials" });
      }
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 36000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

module.exports = router;
