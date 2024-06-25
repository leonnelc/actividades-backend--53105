const ProductService = require("../services/ProductService");
const ProductError = require("../services/errors/api/ProductError");
const ErrorHandler = require("../middleware/ErrorHandler");
const { sendSuccess, buildQueryString } = require("./ControllerUtils");
const { checkRoles } = require("./AuthController");
function socketHandler(io, socket) {
  // TODO: use namespaces instead of a "rtproducts:" prefix
  function isInRoom() {
    return socket.rooms.has("rtproducts");
  }
  const adminOrPremium = checkRoles(["admin", "premium"], { isSocket: true });
  socket.on("rtproducts:join", () => {
    try {
      adminOrPremium(socket.data);
      socket.join("rtproducts");
      socket.emit("rtproducts:success");
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("rtproducts:getProductList", async () => {
    if (!isInRoom()) return;

    socket.emit("rtproducts:productList", await ProductService.getProducts());
  });
  socket.on("rtproducts:deleteProduct", async (pid) => {
    // TODO: Admins should be able to delete any product. Premium users should be able to delete their own products
    if (!isInRoom()) return;
    try {
      await ProductService.deleteProduct(pid);
      io.to("rtproducts").emit(
        "rtproducts:productList",
        await ProductService.getProducts(),
      );
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("rtproducts:addProduct", async (product) => {
    // TODO: add owner to product if it's being added by a non-admin user
    if (!isInRoom()) return;
    try {
      await ProductService.addProduct(product);
      io.to("rtproducts").emit(
        "rtproducts:productList",
        await ProductService.getProducts(),
      );
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
}

async function getProducts(req, res, next) {
  let limit, page, sort, query;
  if (req.query.limit != undefined) {
    limit = Number(req.query.limit);
  }
  if (req.query.page != undefined) {
    page = Number(req.query.page);
  }
  if (["asc", "desc"].includes(req.query.sort)) {
    sort = req.query.sort;
  }
  if (req.query.query != null) {
    try {
      query = JSON.parse(req.query.query);
    } catch (error) {
      next(new ProductError(`Error parsing query: ${error.message}`));
    }
  }
  try {
    const result = await ProductService.getProductsPaged({
      limit,
      page,
      sort,
      query,
    });
    ({
      totalPages,
      prevPage,
      nextPage,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
      page,
    } = result);
    if (page > totalPages) {
      throw new Error(`Invalid page specified`);
    }
    prevLink = prevLink ?? null;
    nextLink = nextLink ?? null;
    const url = req.baseUrl + req.path;
    if (hasPrevPage) {
      prevLink = buildQueryString(req.query, `${url}`, {
        page: result.page - 1,
      });
    }
    if (hasNextPage) {
      nextLink = buildQueryString(req.query, `${url}`, {
        page: result.page + 1,
      });
    }
    let payload = result.docs;
    sendSuccess(res, {
      payload,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function getById(req, res, next) {
  try {
    const product = await ProductService.getProductById(req.params.pid);
    sendSuccess(res, { payload: product });
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function getByCode(req, res, next) {
  try {
    const product = await ProductService.getProductByCode(req.params.code);
    sendSuccess(res, { payload: product });
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function update(req, res, next) {
  try {
    await ProductService.updateProduct(req.params.pid, req.body);
    res.locals.send = {
      status: "success",
      message: "Product updated succesfully",
    };
    res.locals.products = await ProductService.getProducts();
    next();
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function deleteProduct(req, res, next) {
  try {
    await ProductService.deleteProduct(req.params.pid);
    res.locals.send = {
      status: "success",
      message: "Product deleted succesfully",
    };
    res.locals.products = await ProductService.getProducts();
    next();
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function add(req, res, next) {
  try {
    let result = await ProductService.addProduct(req.body);
    res.locals.send = {
      status: "success",
      message: `Product added succesfully with id ${result.id}`,
    };
    res.locals.products = await ProductService.getProducts();
    next();
  } catch (error) {
    next(new ProductError(error.message));
  }
}

module.exports = {
  socketHandler,
  getProducts,
  getById,
  getByCode,
  update,
  deleteProduct,
  add,
};