var Sequelize = require("sequelize");

var attributes = {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: "User name already in use!"
    },
    validate: {
      is: /^[a-z0-9\_\-]+$/i
    }
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    },
    allowNull: false,
    unique: {
      args: true,
      msg: "Email address already in use!"
    }
  },
  firstName: {
    field: "firstname",
    type: Sequelize.STRING
  },
  lastName: {
    field: "lastname",
    type: Sequelize.STRING
  },
  countrycode: {
    type: Sequelize.STRING
  },
  phone: {
    type: Sequelize.STRING
  },
  password: {
    type: Sequelize.STRING
  },
  salt: {
    type: Sequelize.STRING
  },
  authyid: {
    type: Sequelize.STRING
  },
  createdAt: {
    field: "createdat",
    type: Sequelize.DATE
  },
  updatedAt: {
    field: "updatedat",
    type: Sequelize.DATE
  },
  verified: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
};

var options = {
  freezeTableName: true
};

module.exports.attributes = attributes;
module.exports.options = options;
