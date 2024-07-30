class UserDTO {
  constructor(user) {
    this.id = user._id.toString();
    this.full_name = `${user.first_name} ${user.last_name ?? ""}`;
    this.first_name = user.first_name;
    this.last_name = user.last_name ?? null;
    this.email = user.email;
    this.role = user.role;
    this.age = user.age;
    this.last_connection = user.last_connection ?? null;
    if (user.cart)
      this.cart =
        typeof user.cart == "string" ? user.cart : user.cart.toString();
  }
}
module.exports = UserDTO;
