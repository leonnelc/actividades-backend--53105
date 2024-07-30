document.addEventListener("DOMContentLoaded", () => {
  const socket = io();
  const addProductForm = document.getElementById("addProductForm");
  const addProductModal = new bootstrap.Modal(
    document.getElementById("addProductModal"),
  );
  const updateProductForm = document.getElementById("updateProductForm");
  const updateProductModal = new bootstrap.Modal(
    document.getElementById("updateProductModal"),
  );

  socket.emit("rtproducts:join");
  socket.on("rtproducts:success", () => {
    socket.emit("rtproducts:getProductList");
  });

  let user;
  socket.on("user", (data) => {
    user = data;
  });

  document
    .getElementById("submitAddProduct")
    .addEventListener("click", handleAddProduct);
  document
    .getElementById("submitUpdateProduct")
    .addEventListener("click", handleUpdateProduct);

  function handleAddProduct() {
    if (addProductForm.checkValidity()) {
      const product = {
        title: document.getElementById("formTitle").value,
        description: document.getElementById("formDescription").value,
        price: parseFloat(document.getElementById("formPrice").value),
        thumbnails: [document.getElementById("formThumbnails").value],
        code: document.getElementById("formCode").value,
        stock: parseInt(document.getElementById("formStock").value),
        category: document.getElementById("formCategory").value,
        status: document.getElementById("formStatus").checked,
      };
      addProduct(product);
      addProductModal.hide();
      addProductForm.reset();
    } else {
      addProductForm.reportValidity();
    }
  }

  function handleUpdateProduct() {
    if (updateProductForm.checkValidity()) {
      const product = {
        id: document.getElementById("submitUpdateProduct").dataset.id,
        title: document.getElementById("updateFormTitle").value,
        description: document.getElementById("updateFormDescription").value,
        price: parseFloat(document.getElementById("updateFormPrice").value),
        thumbnails: [document.getElementById("updateFormThumbnails").value],
        stock: parseInt(document.getElementById("updateFormStock").value),
        category: document.getElementById("updateFormCategory").value,
        status: document.getElementById("updateFormStatus").checked,
      };
      updateProduct(product);
      updateProductModal.hide();
      updateProductForm.reset();
    } else {
      updateProductForm.reportValidity();
    }
  }
  function populateUpdateProductModal(product) {
    document.getElementById("updateFormTitle").value = product.title;
    document.getElementById("updateFormDescription").value =
      product.description;
    document.getElementById("updateFormPrice").value = product.price;
    document.getElementById("updateFormThumbnails").value = product.thumbnails;
    document.getElementById("updateFormStock").value = product.stock;
    document.getElementById("updateFormCategory").value = product.category;
    document.getElementById("updateFormStatus").checked = product.status;
    document.getElementById("submitUpdateProduct").dataset.id = product.id;
  }

  function deleteProduct(id) {
    socket.emit("rtproducts:deleteProduct", id);
  }

  function addProduct(product) {
    socket.emit("rtproducts:addProduct", product);
  }
  function updateProduct(product) {
    socket.emit("rtproducts:updateProduct", product);
  }

  const productContainer = document.getElementById("product-container");

  function ownsProduct(product) {
    return user?.role == "admin" || user?.id == product.owner;
  }

  function deleteProductCard(id) {
    const card = document.getElementById(id);
    if (!card) {
      return;
    }
    card.remove();
  }

  function updateProductCard(product) {
    if (!ownsProduct(product)) {
      return;
    }
    const card = document.getElementById(product.id);
    if (!card) {
      return addProductCard(product);
    }

    const imageUrl =
      product.thumbnails && product.thumbnails.length > 0
        ? product.thumbnails[0]
        : "";
    const imageHtml = imageUrl
      ? `<img src="${imageUrl}" class="card-img-top img-fluid object-fit-cover" alt="${product.title}">`
      : "";

    card.innerHTML = `
    <div class="card h-100 animation-lift-shadowless border-0 bg-dark-subtle">
      ${imageHtml}
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title}</h5>
        <p class="card-text flex-grow-1">${product.description}</p>
        <p class="card-text"><strong>Price:</strong> $${product.price}</p>
        <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
        <p class="card-text"><small class="text-muted">Owner ID: ${product.owner ?? "admin"}</small></p>
        <button class="btn btn-primary mt-auto mb-2 update-btn" data-id="${product.id}" data-bs-toggle="modal" data-bs-target="#updateProductModal">Update</button>
        <button class="btn btn-danger mt-auto delete-btn" data-id="${product.id}">Delete</button>
      </div>
    </div>
  `;

    card.querySelector(".delete-btn").addEventListener("click", () => {
      deleteProduct(product.id);
    });

    card.querySelector(".update-btn").addEventListener("click", () => {
      populateUpdateProductModal(product);
    });
  }

  function addProductCard(product) {
    if (!ownsProduct(product)) return;
    const card = document.createElement("div");
    card.classList.add(
      "col",
      "col-12",
      "col-sm-5",
      "col-md-3",
      "col-lg-2",
      "m-0",
      "my-3",
      "m-sm-1",
      "m-md-2",
    );
    card.id = product.id;

    const imageUrl =
      product.thumbnails && product.thumbnails.length > 0
        ? product.thumbnails[0]
        : "";
    const imageHtml = imageUrl
      ? `<img src="${imageUrl}" class="card-img-top" alt="${product.title}">`
      : "";

    card.innerHTML = `
    <div class="card h-100 animation-lift-shadowless border-0 bg-dark-subtle">
      ${imageHtml}
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${product.title}</h5>
        <p class="card-text flex-grow-1">${product.description}</p>
        <p class="card-text"><strong>Price:</strong> $${product.price}</p>
        <p class="card-text"><strong>Stock:</strong> ${product.stock}</p>
        <p class="card-text"><small class="text-muted">Owner ID: ${product.owner ?? "admin"}</small></p>
        <button class="btn btn-primary mt-auto mb-2 update-btn" data-id="${product.id}" data-bs-toggle="modal" data-bs-target="#updateProductModal">Update</button>
        <button class="btn btn-danger mt-auto delete-btn" data-id="${product.id}">Delete</button>
      </div>
    </div>
  `;

    card.querySelector(".delete-btn").addEventListener("click", () => {
      deleteProduct(product.id);
    });

    card.querySelector(".update-btn").addEventListener("click", () => {
      populateUpdateProductModal(product);
    });

    productContainer.appendChild(card);
  }

  socket.on("rtproducts:productList", (products) => {
    productContainer.innerHTML = "";
    products.forEach(addProductCard);
  });

  socket.on("rtproducts:addProduct", (product) => {
    addProductCard(product);
  });

  socket.on("rtproducts:updateProduct", (product) => {
    updateProductCard(product);
  });

  socket.on("rtproducts:updateProducts", (products) => {
    products.forEach(updateProductCard);
  });

  socket.on("rtproducts:deleteProduct", (id) => {
    deleteProductCard(id);
  });

  socket.on("rtproducts:deleteProducts", (ids) => {
    ids.forEach(deleteProductCard);
  });

  socket.on("error", (message) => {
    appendAlert(message, "danger", 2500);
  });
});
