const ProductService = require("../services/ProductService");
const ProductError = require("../services/errors/api/ProductError");
const ProductDTO = require("../dtos/ProductDTO");
const MailService = require("../services/MailService");
const ErrorHandler = require("../middleware/ErrorHandler");
const { sendSuccess, buildQueryString } = require("./ControllerUtils");
const { checkRoles } = require("./AuthController");
const ownsProduct = (user, product) => {
  product = new ProductDTO(product);
  if (user.role == "admin" || user.id == product.owner) {
    return true;
  }
  return false;
};
function ProductsDTO(products) {
  const productsDTO = [];
  for (let product of products) {
    productsDTO.push(new ProductDTO(product));
  }
  return productsDTO;
}
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

    socket.emit(
      "rtproducts:productList",
      ProductsDTO(await ProductService.getProducts()),
    );
  });
  socket.on("rtproducts:deleteProduct", async (pid) => {
    if (!isInRoom()) return;
    try {
      if (
        !ownsProduct(socket.data.user, await ProductService.getProductById(pid))
      ) {
        throw new ProductError(`Not authorized to delete product id ${pid}`);
      }
      const product = await ProductService.deleteProduct(pid);
      if (socket.data.user.role != "admin")
        sendDeleteMail(socket.data.user, product);
      io.to("rtproducts").emit("rtproducts:deleteProduct", pid);
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("rtproducts:addProduct", async (product) => {
    if (!isInRoom()) return;
    try {
      const owner =
        socket.data.user.role == "admin" ? null : socket.data.user.id;
      const newProduct = await ProductService.addProduct({ ...product, owner });
      io.to("rtproducts").emit(
        "rtproducts:addProduct",
        new ProductDTO(newProduct),
      );
    } catch (error) {
      ErrorHandler(error, socket.data, socket, "socket");
    }
  });
  socket.on("rtproducts:updateProduct", async (product) => {
    if (!isInRoom()) return;
    try {
      if (
        !ownsProduct(
          socket.data.user,
          await ProductService.getProductById(product.id),
        )
      ) {
        throw new ProductError(
          `Not authorized to update product id ${product.id}`,
        );
      }
      const updatedProduct = await ProductService.updateProduct(
        product.id,
        product,
      );
      io.to("rtproducts").emit(
        "rtproducts:updateProduct",
        new ProductDTO(updatedProduct),
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
    let payload = ProductsDTO(result.docs);
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
    sendSuccess(res, { payload: new ProductDTO(product) });
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function getByCode(req, res, next) {
  try {
    const product = await ProductService.getProductByCode(req.params.code);
    sendSuccess(res, { payload: new ProductDTO(product) });
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function update(req, res, next) {
  try {
    const { pid } = req.params;
    if (!ownsProduct(req.user, await ProductService.getProductById(pid))) {
      throw new Error(`Not authorized to update product id ${pid}`);
    }

    const product = await ProductService.updateProduct(pid, req.body);
    res.locals.send = {
      status: "success",
      message: "Product updated succesfully",
    };
    res.locals.product = new ProductDTO(product);
    next();
  } catch (error) {
    next(new ProductError(error.message));
  }
}
function sendDeleteMail(user, product) {
  MailService.sendMail(
    user.email,
    "Product Deletion Notification",
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Deletion Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #007BFF;
        }
        .message {
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Notification</h1>
        </div>
        <div class="message">
            <p>Hi, ${user.first_name}</p>
            <p>Your product "<strong>${product.title}</strong>" has been deleted from our database.</p>
            <p>If you didn't do this, please contact an administrator.</p>
        </div>
        <div class="footer">
            <p>Thank you</p>
        </div>
    </div>
</body>
</html>`,
  );
}
async function deleteProduct(req, res, next) {
  try {
    const { pid } = req.params;

    if (!ownsProduct(req.user, await ProductService.getProductById(pid))) {
      throw new Error(`Not authorized to delete product id ${pid}`);
    }
    const product = await ProductService.deleteProduct(pid);
    if (req.user.role != "admin") sendDeleteMail(req.user, product);
    res.locals.send = {
      status: "success",
      message: "Product deleted succesfully",
    };
    res.locals.product = pid;
    next();
  } catch (error) {
    next(new ProductError(error.message));
  }
}
async function add(req, res, next) {
  try {
    const owner = req.user.role == "admin" ? null : req.user.id;
    let result = new ProductDTO(
      await ProductService.addProduct({ ...req.body, owner }),
    );
    res.locals.send = {
      status: "success",
      product: result,
    };
    res.locals.product = result;
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
