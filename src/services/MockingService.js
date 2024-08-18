const { faker } = require("@faker-js/faker");

function createRandomProduct() {
  return {
    _id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category: faker.commerce.product(),
    price: faker.commerce.price(),
    stock: faker.number.int({ min: 1, max: 200 }),
    thumbnail: faker.image.url(),
    status: true,
    code: faker.string.uuid(),
  };
}

function createMultipleProducts(count) {
  return faker.helpers.multiple(createRandomProduct, { count });
}
module.exports = { createRandomProduct, createMultipleProducts };
