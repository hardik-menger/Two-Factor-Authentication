const bcrypt = require("bcrypt"),
  Model = require("../models/models"),
  jwt = require("jsonwebtoken"),
  config = require("../../config/keys");

//utilities
const { validateEmail } = require("../utils/isValid");

//twilio authy configs
const authy = require("authy")(config.authyToken);
const twilioClient = require("twilio")(
  config.twilioAccountSid,
  config.twilioAuthToken
);

module.exports.signup = (req, res) => {
  const { username, password, password2, email, phone, countrycode } = req.body;
  if (!username || !password || !password2) {
    return res.json({ err: "All fields are required" });
  }
  if (password !== password2) {
    return res.json({ error: "Please, enter the same password twice." });
  }
  if (!validateEmail(email)) {
    return res.json({ error: "Enter a valid Email-id" });
  }
  //generate salt value
  var salt = bcrypt.genSaltSync(10);
  var hashedPassword = bcrypt.hashSync(password, salt);

  //create user payload
  var newUser = {
    username,
    salt,
    password: hashedPassword,
    email,
    phone,
    countrycode
  };
  Model.User.find({
    where: {
      $or: [
        { username: { $eq: req.body.username } },
        { email: { $eq: req.body.email } }
      ]
    }
  })
    .then(u => {
      if (!u) {
        Model.User.create(newUser)
          .then(user => {
            return res.json({ success: true, user });
          })
          .catch(err => {
            return res.json({
              success: false,
              error: `${err.error.errors.path} validation failed`
            });
          });
      } else {
        return res.json({ success: false, error: "Email or username exists" });
      }
    })
    .catch(err => {
      res.json({ success: false, err });
    });
};

module.exports.signin = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ err: "All fields are required" });
  }

  Model.User.find({ where: { username: req.body.username } })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: "username invalid" });
      } else
        user.comparePassword(password, (err, isMatched) => {
          if (isMatched && !err) {
            user = JSON.parse(JSON.stringify(user));
            jwt_payload = { username: user.username, id: user.id };
            const token = jwt.sign(jwt_payload, "this is a secret", {
              expiresIn: 86400 * 30
            });
            return res.json({ success: true, token: "Bearer " + token });
          } else {
            return res.status(401).send({
              success: false,
              msg: "Authentication failed. Wrong password."
            });
          }
        });
    })
    .catch(err => res.status(400).json({ err }));
};

module.exports.verifyToken = (req, res) => {
  return res.json({
    data: req.user
  });
};

// Handle submission of verification token from authy
module.exports.verify = function(req, resp) {
  let user = {};

  // Load user model
  Model.User.findOne({ where: { username: "hardik" } })
    .then(doc => {
      // If we find the user, let's validate the token they entered
      user = doc;
      user.verifyAuthyToken(req.body.code, postVerify);
    })
    .catch(err => resp.json({ err }));

  // Handle verification res
  function postVerify(err, res) {
    if (err) {
      return die(err);
    }

    // If the token was valid, flip the bit to validate the user account
    user.verified = true;
    user
      .update({
        verified: true
      })
      .then(function(res) {
        resp.json({ res: res.verified });
      })
      .catch(error => resp.json({ error }));
  }

  // respond with an error
  function die(message) {
    resp.json({ message });
  }
};

// Resend a code if it was not received
module.exports.resend = function(req, res) {
  // Load user model
  Model.User.findOne({ where: { username: req.body.username } })
    .then(user =>
      // If we find the user, let's send them a new code
      {
        user.sendAuthyToken(postSend);
      }
    )
    .catch(err => die(err));

  // Handle send code res
  const postSend = (err, response) => {
    if (err) {
      return die(err);
    } else {
      return res.json({ response });
    }
  };

  // respond with an error
  function die(message) {
    res.json({ errors: message });
  }
};

// Show details about the user from authy and twilio
exports.showUser = function(req, res, next) {
  // Load user model
  Model.User.find({ where: { username: req.body.username } }, function(
    err,
    user
  ) {
    if (err || !user) {
      // 404
      return next();
    }

    res.json({
      user,
      // any success messages
      successes: true
    });
  });
};
