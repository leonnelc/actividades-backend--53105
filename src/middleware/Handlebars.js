const hbs = require("express-handlebars");

const engine = hbs.create({
  handlebars:
    require("@handlebars/allow-prototype-access").allowInsecurePrototypeAccess(
      require("handlebars"),
    ),
  helpers: {
    firstChar: (str) => (str ? str.charAt(0).toUpperCase() : ""),
    eq: (a, b) => a === b,
    neq: (a, b) => a !== b,
    not: (value) => value,
  },
}).engine;

module.exports = engine;
