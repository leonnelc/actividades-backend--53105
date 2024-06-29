const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "My Ecommerce API documentation",
      description: "API documentation for my MongoExpressNode Ecommerce",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
