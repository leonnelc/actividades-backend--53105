function queryRedirect(queries, values) {
  // Sets queries and redirects, keeping the other queries. Deletes the query if value is empty.
  let params = new URLSearchParams(window.location.search);
  for (i in queries) {
    params.set(queries[i], values[i]);
    if (values[i] == "") {
      params.delete(queries[i]);
    }
  }
  window.location.search = params.toString();
}
const sortSelector = document.getElementById("sort-selector");
const categorySelector = document.getElementById("category-selector");
let search = new URLSearchParams(window.location.search);
sortSelector.value = search.get("sort") ?? "";
categorySelector.value = JSON.parse(search.get("query"))?.category ?? "";
sortSelector.onchange = (event) => {
  queryRedirect(["sort"], [event.target.value]);
};
categorySelector.onchange = (event) => {
  queryRedirect(
    ["query", "page"],
    [event.target.value != "" ? `{"category":"${event.target.value}"}` : "", ""]
  );
};
function goBack() {
  queryRedirect(["page"], [1]);
}

async function addToCart(productId) {
  try {
    const response = await fetch(
      `/api/carts/${cartId}/products/${productId}`,
      { method: "POST" }
    );
    const result = await response.json();
    if (result.status) {
      appendAlert("Product added succesfully", "success");
    }
  } catch (error) {
    appendAlert("Couldn't add product", "danger");
  }
}
const alertContainer = document.getElementById("alert-container");
const appendAlert = (message, type) => {
  const alert = document.createElement("div");
  const alertMessage = document.createElement("div");
  alertMessage.innerHTML = message;
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("btn-close");
  button.setAttribute("data-bs-dismiss", "alert");
  button.setAttribute("aria-label", "Close");
  alert.classList.add(
    "alert",
    `alert-${type}`,
    "alert-dismissible",
    "my-1",
    "mx-auto",
    "fade"
  );
  alert.appendChild(alertMessage);
  alert.appendChild(button);
  alertContainer.append(alert);
  setTimeout(() => {
    alert.classList.add("show");
  }, 10);
  setTimeout(() => {
    button.click();
  }, 2000);
};