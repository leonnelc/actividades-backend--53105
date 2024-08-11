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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); //for testing only
async function purchaseCart(cid) {
  const loadingCircle = document.createElement("div");
  loadingCircle.classList.add(
    "spinner-border",
    "text-primary",
    "position-absolute",
    "top-50",
    "start-50",
  );
  loadingCircle.setAttribute("role", "status");
  const loadingCircleSpan = document.createElement("span");
  loadingCircleSpan.classList.add("visually-hidden");
  loadingCircleSpan.textContent = "Loading...";
  loadingCircle.appendChild(loadingCircleSpan);
  const loadingBackdrop = document.createElement("div");
  loadingBackdrop.classList.add("modal-backdrop", "fade", "show");
  document.body.appendChild(loadingBackdrop);
  document.body.appendChild(loadingCircle);
  let purchase;
  try {
    const response = await fetch(`/api/carts/${cid}/purchase`, {
      method: "POST",
    });
    purchase = await response.json();
    if (purchase.status == "error") {
      throw new Error(purchase.message);
    }
  } catch (error) {
    return appendAlert(error.message, "danger", 3000);
  } finally {
    document.body.removeChild(loadingBackdrop);
    document.body.removeChild(loadingCircle);
  }

  const purchaseModal = new bootstrap.Modal(
    document.getElementById("purchaseModal"),
  );
  const ticketCode = document.getElementById("ticketCode");
  const purchaseDate = document.getElementById("purchaseDate");
  const purchaseAmount = document.getElementById("purchaseAmount");
  const purchaser = document.getElementById("purchaser");
  const notPurchasedItemsList = document.getElementById(
    "notPurchasedItemsList",
  );
  const purchasedItemsList = document.getElementById("purchasedItemsList");

  ticketCode.textContent = purchase.ticket.code;
  purchaseDate.textContent = new Date(
    purchase.ticket.purchase_datetime,
  ).toLocaleString();
  purchaseAmount.textContent = purchase.ticket.amount;
  purchaser.textContent = purchase.ticket.purchaser;
  // Clear the not purchased items list
  notPurchasedItemsList.innerHTML = "";
  purchasedItemsList.innerHTML = "";

  // Add not purchased items to the list
  if (purchase.not_purchased && purchase.not_purchased.length > 0) {
    purchase.not_purchased.forEach((item) => {
      const li = document.createElement("li");
      const product = document.getElementById(item.id);
      const quantity = item.requiredStock;
      li.textContent = `${product.getAttribute("data-title")} x${quantity}`;
      notPurchasedItemsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No items were not purchased.";
    notPurchasedItemsList.appendChild(li);
  }
  // Delete purchased items from the cart page
  if (purchase.purchased && purchase.purchased.length > 0) {
    purchase.purchased.forEach((item) => {
      const li = document.createElement("li");
      const product = document.getElementById(item.id);
      const quantity = item.quantity;
      li.textContent = `${product.getAttribute("data-title")} x${quantity}`;
      purchasedItemsList.appendChild(li);
      product.remove();
    });
  }

  purchaseModal.show();
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
  const quantityTextElement = document.querySelector(
    `#${CSS.escape(productId)} #quantity`,
  );
  quantityTextElement.textContent = newQuantity;
}

function addTotal(number, set = false) {
  const totalElement = document.getElementById("total");
  const total = Number(totalElement.textContent);
  if (isNaN(number) || isNaN(total)) return;
  totalElement.textContent = `${(total + Number(number)).toFixed(2)}`;
  if (set) totalElement.textContent = `${number}`;
}

function getItemTotalPrice(productId) {
  const cardElement = document.querySelector(`#${CSS.escape(productId)}`);
  const itemPrice = Number(
    cardElement.querySelector("#price span").textContent,
  );
  const itemQuantity = Number(
    cardElement.querySelector("#quantity input").getAttribute("quantity"),
  );
  return Number((itemPrice * itemQuantity).toFixed(2));
}

function removeItem(productId) {
  const cardElement = document.querySelector(`#${CSS.escape(productId)}`);
  addTotal(-getItemTotalPrice(productId));
  cardElement.remove();
}
async function updateQuantity(productId) {
  try {
    const cardElement = document.querySelector(`#${CSS.escape(productId)}`);
    const quantityInput = document.querySelector(
      `#${CSS.escape(productId)} #quantity input`,
    );
    const quantity = parseInt(quantityInput.value);
    if (quantityInput.value == quantityInput.getAttribute("quantity")) {
      return;
    }
    const priceBefore = getItemTotalPrice(productId);
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });
    const result = await response.json();
    if (!response.ok) {
      return appendAlert(result.message, "danger", 2500);
    }
    cardElement.setAttribute("data-quantity", quantity);
    if (quantity <= 0) {
      removeItem(productId);
      return appendAlert("Product quantity updated", "info", 2500);
    }
    appendAlert("Product quantity updated", "info", 2500);
    quantityChange(quantityInput, quantity);
    addTotal(getItemTotalPrice(productId) - priceBefore);
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
function quantityChange(inputElement, value) {
  if (value) {
    inputElement.setAttribute("quantity", value);
  }
  const quantity = inputElement.getAttribute("quantity");
  const changed = inputElement.value != quantity;
  const button = inputElement.parentElement.querySelector("#apply");
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

async function addLocalCart() {
  if (!localStorage.cart || !cartId) return;
  await fetch(`/api/carts/${cartId}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: localStorage.cart,
  });
  localStorage.removeItem("cart");
  window.location.reload();
}

function updateLocalQuantity(id) {
  const cart = JSON.parse(localStorage.cart);
  const quantityInput = document.querySelector(
    `#${CSS.escape(id)} #quantity input`,
  );
  const newQuantity = quantityInput.valueAsNumber;
  const prevQuantity = Number(cart[id].quantity);
  cart[id].quantity = newQuantity;
  localStorage.cart = JSON.stringify(cart);
  addTotal(
    Number(
      (
        (quantityInput.valueAsNumber - prevQuantity) *
        Number(cart[id].price)
      ).toFixed(2),
    ),
  );
}

function removeFromLocalCart(id) {
  const cart = JSON.parse(localStorage.cart);
  cart[id] = undefined;
  localStorage.cart = JSON.stringify(cart);
  removeItem(id);
}

async function renderLocalCart() {
  if (!localStorage.cart || cartId) return;
  const cart = JSON.parse(localStorage.cart);
  const cartContainer = document.getElementById("cart-items");
  addTotal(0, true);
  for (let id of Object.keys(cart)) {
    const product = cart[id];
    const quantity = cart[id].quantity;
    const cardElement = document.createElement("div");
    cardElement.classList.add("col-md-4", "mb-3");
    cardElement.setAttribute("data-title", product.title);
    cardElement.setAttribute("id", id);
    cardElement.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <p class="card-text" id="price">Price: <span id="price">${product.price}</span></p>
          <p class="card-text" id="quantity">Quantity: <input id="quantity" min="1" quantity="${quantity}" name="quantity"
              type="number" class="border-0 bg-transparent" style="width: 3.2rem;" value=${quantity} onchange="javascript:updateLocalQuantity('${id}')"></p>
          <button class="btn btn-secondary" onclick="javascript:removeFromLocalCart('${id}')">Remove
            from cart</button>
        </div>
      </div>`;
    cartContainer.appendChild(cardElement);
    addTotal(Number((Number(product.price) * Number(quantity)).toFixed(2)));
  }
}

addLocalCart();
renderLocalCart();
