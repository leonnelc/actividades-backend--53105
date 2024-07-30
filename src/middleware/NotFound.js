function NotFound(req, res) {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ status: "error", message: "Page not found" });
  }
  res.status(404).render("message", {
    message: "404 Page not found",
    error: true,
    title: "404 Not found",
  });
}
module.exports = NotFound;
