var Sequelize = require("sequelize"),
  sequelize = new Sequelize("auth", "postgres", "menger", {
    host: "localhost",
    dialect: "postgres"
  });
sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch(err =>
    console.log("Unable to connect to database", JSON.stringify(err))
  );
module.exports = sequelize;
