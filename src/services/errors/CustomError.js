class CustomError extends Error {
  constructor(message, info = { name: "Error", data: null }) {
    info = { ...{ name: "Error", data: null }, ...info };
    super(message);
    this.name = info.name;
    this.data = info.data;
  }
}

module.exports = CustomError;
