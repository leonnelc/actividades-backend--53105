class UserDTO {
  constructor(user) {
    this.id = user._id;
    this.full_name = `${user.first_name} ${user.last_name ?? ""}`;
    this.first_name = user.first_name;
    this.last_name = user.last_name ?? null;
    this.email = user.email;
    this.role = user.role;
    this.age = user.age;
    this.cart = user.cart;
  }
}
module.exports = UserDTO;
