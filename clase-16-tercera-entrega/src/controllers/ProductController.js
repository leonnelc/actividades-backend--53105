const ProductService = require("../services/ProductService");
const {
  sendError,
  sendSuccess,
  buildQueryString,
} = require("./ControllerUtils");
const { debugLog } = require("../utils/utils");
function socketHandler(io, socket) {
  // This should all be done with socket.io namespaces but i couldn't get it working
  function isInRoom() {
    return socket.rooms.has("rtproducts");
  }
  socket.on("rtproducts:join", () => {
    if (!socket?.data?.loggedIn) {
      return debugLog("Socket not logged in");
    }
    if (socket.data.user.role !== "admin") {
      return debugLog("Socket not authorized");
    }
    socket.join("rtproducts");
    socket.emit("rtproducts:success");
  });
  socket.on("rtproducts:getProductList", async () => {
    if (!isInRoom()) return;

    socket.emit("rtproducts:productList", await ProductService.getProducts());
  });
  socket.on("rtproducts:deleteProduct", (pid) => {
    if (!isInRoom()) return;
    ProductService.deleteProduct(pid).then(async () => {
      io.to("rtproducts").emit(
        "rtproducts:productList",
        await ProductService.getProducts()
      );
    });
  });
  socket.on("rtproducts:addProduct", async (product) => {
    if (!isInRoom()) return;
    ProductService.addProduct(product)
      .then(async () => {
        io.to("rtproducts").emit(
          "rtproducts:productList",
          await ProductService.getProducts()
        );
      })
      .catch((err) => {
        debugLog(`Error adding product: ${err}`);
        socket.emit("error", `Error adding product: ${err.message}`);
      });
  });
}

async function getProducts(req, res) {
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
      return sendError(res, new Error(`Error parsing query: ${error.message}`));
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
    sendError(res, error);
  }
}
async function getById(req, res) {
  try {
    const product = await ProductService.getProductById(req.params.pid);
    sendSuccess(res, { payload: product });
  } catch (error) {
    sendError(res, error);
  }
}
async function getByCode(req, res) {
  try {
    const product = await ProductService.getProductByCode(req.params.code);
    sendSuccess(res, { payload: product });
  } catch (error) {
    sendError(res, error);
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
    sendError(res, error);
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
    sendError(res, error);
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
    sendError(res, error);
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
