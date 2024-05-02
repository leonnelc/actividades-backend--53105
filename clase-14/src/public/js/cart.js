const loc = window.location.pathname;
let session;
let cartId;
try {
  cartId = document.getElementById("cart-items").getAttribute("cart-id");
  if (!cartId) throw new Error("Null cart id");
} catch (error) {
  // if it fails then fetch it from the session
  getSession().then((result) => {
    session = result.session;
    cartId = session.cart;
    console.log(session);
  });
}
async function getSession() {
  const response = await fetch("/api/sessions/current", { method: "GET" });
  session = await response.json();
  return session;
}
function getQuantityElements() {
  const quantityElements = document.getElementsByName("quantity");
  return quantityElements;
}
function updateVisibleQuantity(productId, newQuantity) {
  const cardElement = document.querySelector(`div.card[id="${productId}"]`);
  const quantityParentElement = cardElement.querySelector(
    "p.card-text#quantity"
  );
  const quantityElement = quantityParentElement.querySelector("#quantity");
  //const quantity = parseInt(quantityElement.textContent);
  quantityElement.textContent = newQuantity;
}
function removeItem(productId) {
  const cardElement = document.querySelector(`div.card[id="${productId}"]`);
  cardElement.remove();
}
async function updateQuantity(productId) {
  try {
    const cardElement = document.querySelector(`div.card[id="${productId}"]`);
    const quantityParentElement = cardElement.querySelector(
      "p.card-text#quantity"
    );
    const quantityElement = quantityParentElement.querySelector("#quantity");
    const quantity = parseInt(quantityElement.value);
    if (quantityElement.value == quantityElement.getAttribute("quantity")) {
      return;
    }
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });
    const result = await response.json();
    if (result.status == "error") {
      return appendAlert(result.message, "danger", 2500);
    }
    cardElement.setAttribute("data-quantity", quantity);
    if (quantity <= 0) {
      cardElement.remove();
      return appendAlert("Product quantity updated", "info", 2500);
    }
    appendAlert("Product quantity updated", "info", 2500);
    quantityChange(quantityElement, quantity);
  } catch (error) {
    console.log(error);
    appendAlert("Couldn't update product", "danger", 2500);
  }
}
async function removeFromCart(productId) {
  try {
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "DELETE",
    });
    const result = await response.json();
    if (result.status == "error") {
      throw new Error(result.message);
    }
    appendAlert("Item removed", "success");
    removeItem(productId);
  } catch (error) {
    appendAlert("Can't remove item", "danger");
  }
}
async function clearCart() {
  try {
    const response = await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
    const result = await response.json();
    if (result.status == "error") {
      throw new Error(result.message);
    }
    window.location.href = "";
  } catch (error) {
    appendAlert("Error clearing cart");
  }
}
function quantityChange(element, value) {
  if (value) {
    element.setAttribute("quantity", value);
  }
  const quantity = element.getAttribute("quantity");
  const changed = element.value != quantity;
  const button = element.parentElement.querySelector("#apply");
  if (changed) {
    return button.classList.remove("invisibility", "disabled");
  }
  button.classList.add("invisibility", "disabled");
}
getQuantityElements().forEach((element) => {
  element.addEventListener("change", () => {
    quantityChange(element);
  });
});
