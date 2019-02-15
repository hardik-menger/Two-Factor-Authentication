const express = require("express"),
  app = express(),
  setUpPassport = require("./app/setUpPassport"),
  session = require("express-session"),
  bodyParser = require("body-parser"),
  cookieParser = require("cookie-parser"),
  jsonParser = bodyParser.json(),
  passport = require("passport");

//controllers
signupController = require("./app/controllers/signupController");

//setup cookies and sessions
app.use(cookieParser());
app.use(session({ secret: "menger999" }));

//setup bodyparser for http requests
app.use(jsonParser);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

//passport
setUpPassport(app);

app.post("/signup", signupController.signup);
app.post("/signin", signupController.signin);
app.post(
  "/verify-token",
  passport.authenticate("jwt", { session: false }),
  signupController.verifyToken
);
app.post(
  "/verify-phone",
  passport.authenticate("jwt", { session: false }),
  signupController.resend
);
app.post(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  signupController.verify
);

//initialize port
var port = process.env.PORT || 5000;
app.listen(port, () => console.log(`running at port ${port}`));
