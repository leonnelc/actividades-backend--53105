const Product = require(`../models/Product`);

async function addProduct({
  title,
  description,
  price,
  thumbnails,
  code,
  stock,
  category,
  status,
}) {
  const product = await Product.create({
    title,
    description,
    price,
    thumbnails,
    code,
    stock,
    category,
    status,
  });
  return product;
}
async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new Error(`Product id ${id} not found`);
  }
}
async function getProductsPaged({ limit, page, query, sort }) {
  page = page ?? 1;
  limit = limit ?? 10;
  if (sort != null) {
    switch (sort) {
      case `asc`:
        sort = { price: 1 };
        break;
      case `desc`:
        sort = { price: -1 };
        break;
      default:
        sort = undefined;
    }
  }
  let pagOptions = {
    sort,
    page,
    limit,
  };
  return await Product.paginate(query, pagOptions);
}
async function getCategories() {
  return await Product.distinct(`category`);
}
async function getProducts(limit) {
  if (limit) {
    return await Product.find().limit(limit).lean();
  }
  return await Product.find().lean();
}
async function getProductById(id) {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error(`Product id ${id} not found`);
  }
  return product;
}
async function getProductByCode(code) {
  const product = await Product.findOne({ code });
  if (!product) {
    throw new Error(`Product with code ${code} not found`);
  }
  return product;
}
async function updateProduct(id, obj) {
  // Updates the fields passed in obj, example:
  // obj={title:`New title`, description:`New description`} will update title and description.
  // passing _id, __v or properties that don't exist will have no effect as they will be skipped.
  const product = await getProductById(id);
  let productKeys = Object.keys(product._doc);
  for (let key of Object.keys(obj)) {
    if ([`_id`, `__v`].includes(key)) {
      continue;
    }
    if (productKeys.includes(key)) {
      if (obj[key] != null) {
        product[key] = obj[key];
      }
    }
  }
  return await product.save();
}

module.exports = {
  addProduct,
  deleteProduct,
  getProducts,
  getProductsPaged,
  getProductById,
  getProductByCode,
  getCategories,
  updateProduct,
};
