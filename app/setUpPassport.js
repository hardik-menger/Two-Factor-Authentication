var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  bcrypt = require("bcrypt"),
  Model = require("./models/models");

//for jwt auth
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

module.exports = function(app) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(function(username, password, done) {
      Model.User.findOne({
        where: {
          username: username
        }
      }).then(function(user) {
        if (user == null) {
          return done(null, false, { message: "Incorrect credentials." });
        }

        var hashedPassword = bcrypt.hashSync(password, user.salt);

        if (user.password === hashedPassword) {
          return done(null, user);
        }

        return done(null, false, { message: "Incorrect credentials." });
      });
    })
  );

  //verify jwt token
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: "this is a secret"
      },
      function(jwtPayload, cb) {
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        console.log(jwtPayload.id);
        return Model.User.findOne({
          where: {
            id: jwtPayload.id
          },
          attributes: {
            include: ["id", "username", "updatedAt", "createdAt"],
            exclude: ["email", "firstName", "lastName", "salt", "password"]
          }
        })
          .then(user => {
            return cb(null, user);
          })
          .catch(err => {
            return cb(err);
          });
      }
    )
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    Model.User.findOne({
      where: {
        id: id
      }
    }).then(function(user) {
      if (user == null) {
        done(new Error("Wrong user id."));
      }

      done(null, user);
    });
  });
};
