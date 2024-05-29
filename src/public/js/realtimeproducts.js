const socket = io();
const errmsg = document.getElementById("errmsg");
socket.emit("rtproducts:join");
socket.on("rtproducts:success", () => {
  console.log("Success joining to rtproducts");
  socket.emit("rtproducts:getProductList");
});
document
  .getElementById("addProductBtn")
  .addEventListener("click", openAddProductDialog);
function openAddProductDialog() {
  Swal.fire({
    title: "Add Product",
    html: `
      <input id="formTitle" class="swal2-input" placeholder="Title">
      <input id="formDescription" class="swal2-input" placeholder="Description">
      <input id="formPrice" class="swal2-input" placeholder="Price" type="number" step="any">
      <input id="formThumbnails" class="swal2-input" placeholder="Thumbnail">
      <input id="formCode" class="swal2-input" placeholder="Code">
      <input id="formStock" class="swal2-input" placeholder="Stock" type="number">
      <input id="formCategory" class="swal2-input" placeholder="Category">
      <div class="swal2-status-container">
        <label class="swal2-status-label">
          <input id="formStatus" type="checkbox" checked>
          Status
        </label>
      </div>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const title = document.getElementById("formTitle").value;
      const description = document.getElementById("formDescription").value;
      const price = parseFloat(document.getElementById("formPrice").value);
      const thumbnail = document.getElementById("formThumbnails").value;
      const code = document.getElementById("formCode").value;
      const stock = parseInt(document.getElementById("formStock").value);
      const category = document.getElementById("formCategory").value;
      const status = document.getElementById("formStatus").checked;

      if (
        !title ||
        !description ||
        isNaN(price) ||
        !code ||
        isNaN(stock) ||
        !category
      ) {
        Swal.showValidationMessage("Please fill in all required fields");
      }

      return {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
        status,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const newProduct = result.value;
      console.log("Adding product:", newProduct);
      addProduct(newProduct);
    }
  });
}

function deleteProduct(id) {
  errmsg.textContent = "";
  socket.emit("rtproducts:deleteProduct", id);
}
function addProduct() {
  errmsg.textContent = "";
  const title = document.getElementById("formTitle");
  const description = document.getElementById("formDescription");
  const price = document.getElementById("formPrice");
  const thumbnails = document.getElementById("formThumbnails");
  const code = document.getElementById("formCode");
  const stock = document.getElementById("formStock");
  const category = document.getElementById("formCategory");
  const status = document.getElementById("formStatus");
  const product = {
    title: title.value,
    description: description.value,
    price: price.value,
    thumbnails: [thumbnails.value],
    code: code.value,
    stock: stock.value,
    category: category.value,
    status: status.value == "on",
  };
  socket.emit("rtproducts:addProduct", product);
}
const productContainer = document.getElementById("product-container");
socket.on("rtproducts:productList", (products) => {
  productContainer.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("product-card");

    const title = document.createElement("h2");
    title.textContent = product.title;
    card.appendChild(title);

    const description = document.createElement("p");
    description.textContent = product.description;
    card.appendChild(description);

    const price = document.createElement("span");
    price.textContent = `$${product.price}`;
    card.appendChild(price);

    const br = document.createElement("br");
    card.appendChild(br);

    const stock = document.createElement("span");
    stock.textContent = ` Stock: ${product.stock}`;
    card.appendChild(stock);

    const thumbnails = document.createElement("div");
    product.thumbnails.forEach((thumbnail) => {
      const img = document.createElement("img");
      img.src = thumbnail;
      thumbnails.appendChild(img);
    });
    card.appendChild(thumbnails);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => {
      deleteProduct(product._id);
    };
    card.appendChild(deleteButton);

    productContainer.appendChild(card);
  });
});
socket.on("error", (message) => {
  errmsg.textContent = message;
});
