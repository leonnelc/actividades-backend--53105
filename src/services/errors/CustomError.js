class CustomError extends Error {
  constructor(message, info = { name: "Error", data: null }) {
    super(message);
    this.name = info.name;
    this.data = info.data;
  }
}

module.exports = CustomError;
