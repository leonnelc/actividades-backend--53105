function UpdateSockets(io) {
  // this is used to send updates to clients using websockets
  return (req, res, next) => {
    if (!res.locals.send || !res.locals.products) {
      return next();
    }
    res.send(res.locals.send);
    io.emit("productList", res.locals.products);
  };
}
module.exports = UpdateSockets;
