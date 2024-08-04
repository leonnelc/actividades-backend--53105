const resetButton = document.getElementById("reset-filters");
const sortSelector = document.getElementById("sort-selector");
const categorySelector = document.getElementById("category-selector");
const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const searchIcon = document.getElementById("searchIcon");
const searchSpinner = document.getElementById("searchSpinner");
const search = new URLSearchParams(window.location.search);

function queryRedirect(queries, values) {
  // Set query and redirect, keeping the existing queries. Delete query if value is an empty string.
  // example: queries = ["q"], values = ["this is the query value of q"]
  let params = new URLSearchParams(window.location.search);
  for (let i in queries) {
    params.set(queries[i], values[i]);
    if (values[i] == "") {
      params.delete(queries[i]);
    }
  }
  window.location.search = params.toString();
}

searchInput.value = search.get("q") ?? "";
searchForm.onsubmit = (event) => {
  event.preventDefault();
  queryRedirect(["q"], [searchInput.value]);
  searchIcon.classList.add("d-none");
  searchSpinner.classList.remove("d-none");
};

resetButton.onclick = () => {
  window.location.search = "";
};

sortSelector.value = search.get("sort") ?? "";
categorySelector.value = JSON.parse(search.get("query"))?.category ?? "";
sortSelector.onchange = (event) => {
  queryRedirect(["sort"], [event.target.value]);
};
categorySelector.onchange = (event) => {
  queryRedirect(
    ["query", "page"],
    [
      event.target.value != "" ? `{"category":"${event.target.value}"}` : "",
      "",
    ],
  );
};
function goBack() {
  queryRedirect(["page"], [1]);
}

async function addToCart(productId) {
  try {
    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "POST",
    });
    const result = await response.json();
    if (result.status == "error") {
      return appendAlert(result.message, "danger", 2500);
    }
    appendAlert("Product added succesfully", "success", 2500);
  } catch (error) {
    switch (error.name) {
      case "ReferenceError":
        return appendAlert("Log in before adding products", "info", 2500);
      default:
        appendAlert("Couldn't add product", "danger", 2500);
    }
  }
}
