const loc = window.location.pathname;
const cartId = loc.match(/carts\/([a-f0-9]+)/)[1]; // gets the cart id from the url
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
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });
    const result = await response.json();
    if (result.status == "error") {
      return appendAlert(result.message, "danger");
    }
    cardElement.setAttribute("data-quantity", quantity);
    if (quantity <= 0){
        cardElement.remove();
    }
    appendAlert("Product quantity updated", "info");
  } catch (error) {
    appendAlert("Couldn't update product", "danger");
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
