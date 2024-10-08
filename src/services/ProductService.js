const Product = require(`../models/Product`);
const ProductError = require("./errors/api/ProductError");
const { escapeRegex } = require("../utils/utils");
const categories = {
  categories: [],
  updatedAt: new Date(0),
  updateRate: 15 * 60 * 1000,
};

async function addProduct({
  title,
  description,
  price,
  thumbnail,
  code,
  stock,
  category,
  status,
  owner,
}) {
  const product = await Product.create({
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
    category,
    status,
    owner,
  });
  updateCategories();
  return product;
}
async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new ProductError(`Product id ${id} not found`);
  }
  updateCategories();
  return product;
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

async function getProductsPaginated(
  queryParams = {
    page: 1,
    limit: 10,
    sort: "_id",
    order: "asc",
    q: "",
    category: undefined,
  },
) {
  let {
    page = 1,
    limit = 10,
    sort = "_id",
    order = "asc",
    q = "",
    category = undefined,
  } = queryParams;
  q = q.trim().toLowerCase();
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: order == "asc" ? 1 : -1 },
  };

  const mongoQuery = {};

  if (category) mongoQuery.category = category;
  if (q) mongoQuery.title = { $regex: escapeRegex(q), $options: "i" };

  const result = await Product.paginate(mongoQuery, options);

  return result;
}

async function updateCategories() {
  categories.updatedAt = new Date(Date.now());
  categories.categories = await Product.distinct(`category`);
}

async function getCategories() {
  if (Date.now() - categories.updatedAt > categories.updateRate)
    await updateCategories();
  return categories.categories;
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
    throw new ProductError(`Product id ${id} not found`);
  }
  return product;
}
async function getProductByCode(code) {
  const product = await Product.findOne({ code });
  if (!product) {
    throw new ProductError(`Product with code ${code} not found`);
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
  await product.save();
  updateCategories();
  return product;
}
async function getProductsByOwner(owner) {
  return await Product.find({ owner });
}

async function uploadProductImage(pid, image) {
  const product = await getProductById(pid);
  if (product.images.includes(image)) return product.images;
  product.images.push(image);
  await product.save();
  return product;
}

async function deleteProductImage(pid, imagePath) {
  const product = await getProductById(pid);
  const imageIndex = product.images.find((path) => {
    path == imagePath;
  });
  if (imageIndex == -1)
    throw new ProductError(
      `Image ${imagePath} not found for product id ${pid}`,
    );
  product.images.splice(imageIndex, 1);
  await product.save();
  return product;
}

module.exports = {
  addProduct,
  deleteProduct,
  getProducts,
  getProductsPaginated,
  getProductsByOwner,
  getProductsPaged,
  getProductById,
  getProductByCode,
  getCategories,
  updateProduct,
  uploadProductImage,
  deleteProductImage,
};
