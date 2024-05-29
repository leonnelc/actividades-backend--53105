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
    if (result.status == "error") {
      return appendAlert(result.message, "danger");
    }
    appendAlert("Product added succesfully", "success");
  } catch (error) {
    switch (error.name){
      case "ReferenceError":
        return appendAlert("Log in before adding products", "info");
      default:
        appendAlert("Couldn't add product", "danger");
    }
  }
}