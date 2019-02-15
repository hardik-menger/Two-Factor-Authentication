var UserMeta = require("./User.js"),
  connection = require("../sequelize.js"),
  bcrypt = require("bcrypt"),
  config = require("../../config/keys");

//twilio authy configs
const authy = require("authy")(config.authyToken);
const twilioClient = require("twilio")(
  config.twilioAccountSid,
  config.twilioAuthToken
);

var User = connection.define("users1", UserMeta.attributes, UserMeta.options);
User.prototype.comparePassword = function(passw, cb) {
  bcrypt.compare(passw, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

//for sending token from authy
User.prototype.sendAuthyToken = function(cb) {
  var self = this;

  if (!self.authyId) {
    // Register this user if it's a new user
    authy.register_user(
      self.email,
      self.phone,
      self.countrycode,
      (err, response) => {
        //   console.log(self.email, self.phone, self.countrycode, response.user.id);
        if (err || !response.user) return cb.call(self, err);

        self
          .update({ authyid: response.user.id })
          .then(res => {
            sendToken(cb);
          })
          .catch(err => cb.call(self, err));
      }
    );
  } else {
    // Otherwise send token to a known user
    sendToken(cb);
  }

  // With a valid Authy ID, send the 2FA token for this user
  function sendToken(cb) {
    authy.request_sms(self.authyid, true, function(err, response) {
      cb.call(self, err, response);
    });
  }
};

// Test a 2FA token
User.prototype.verifyAuthyToken = function(otp, cb) {
  const self = this;
  authy.verify(self.authyid, otp, function(err, response) {
    cb.call(self, err, response);
  });
};

// Send a text message via twilio to this user
User.prototype.sendMessage = function(message, successCallback, errorCallback) {
  const self = this;
  const toNumber = `+${self.countryCode}${self.phone}`;

  twilioClient.messages
    .create({
      to: toNumber,
      from: config.twilioNumber,
      body: message
    })
    .then(function() {
      successCallback();
    })
    .catch(function(err) {
      errorCallback(err);
    });
};

// you can define relationships here

module.exports.User = User;
