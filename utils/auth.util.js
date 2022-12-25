const constants = require("../utils/constants");

const checkAdmin = (user) => {
  return user.roles.includes(constants.ADMIN);
}

module.exports = { checkAdmin };