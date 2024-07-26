function UpdateSockets(io) {
  // this is used to send updates to clients using websockets
  return (req, res, next) => {
    if (!res.locals.send) {
      return next();
    }
    const send = (signal, message) => {
      io.to("rtproducts").emit(`rtproducts:${signal}`, message);
    };
    switch (req.method) {
      case "POST":
        if (res.locals.product) send("addProduct", res.locals.product);
        if (res.locals.products) send("productList", res.locals.products);
        break;
      case "PUT":
        if (res.locals.product) send("updateProduct", res.locals.product);
        break;
      case "DELETE":
        if (res.locals.product) send("deleteProduct", res.locals.product);
        if (res.locals.products) send("deleteProducts", res.locals.products);
        break;
      default:
        if (res.locals.products) send("productList", res.locals.products);
        break;
    }
    res.send(res.locals.send);
  };
}
module.exports = UpdateSockets;
