class CustomError extends Error {
  constructor({ name = "Error", message, data = null }) {
    super(message);
    this.name = name;
    this.data = data;
  }
}

module.exports = CustomError;
