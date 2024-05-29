function NotFound(req, res) {
  res.status(404).render("message", {
    message: "404 Page not found",
    error: true,
    title: "404 Not found",
  });
}
module.exports = NotFound;
