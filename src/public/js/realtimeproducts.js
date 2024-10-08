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
  document
    .getElementById("imageUploadBtn")
    .addEventListener("click", async () => {
      const imageInput = document.getElementById("updateFormImage");
      const productId = document.getElementById("submitUpdateProduct").dataset
        .id;
      if (imageInput.files.length < 1) return;
      const formData = new FormData();
      formData.append("productImage", imageInput.files[0]);
      imageInput.value = "";
      const response = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) return;
      const result = await response.json();
      populateUpdateProductModal(result.product);
    });

  function handleAddProduct() {
    if (addProductForm.checkValidity()) {
      const product = {
        title: document.getElementById("formTitle").value,
        description: document.getElementById("formDescription").value,
        price: parseFloat(document.getElementById("formPrice").value),
        thumbnail: document.getElementById("formThumbnail").value,
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
        thumbnail: document.getElementById("updateFormThumbnail").value,
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
    document.getElementById("updateFormThumbnail").value = product.thumbnail;
    document.getElementById("updateFormStock").value = product.stock;
    document.getElementById("updateFormCategory").value = product.category;
    document.getElementById("updateFormStatus").checked = product.status;
    document.getElementById("submitUpdateProduct").dataset.id = product.id;
    const modalImages = document.getElementById("updateModalImages");
    modalImages.innerHTML = "";
    if (!product.images) product.images = [];
    for (let image of product.images) {
      const imageElement = document.createElement("li");
      imageElement.className =
        "list-group-item d-flex justify-content-between align-items-center text-break text-wrap";
      imageElement.textContent = image;
      const buttonGroup = document.createElement("div");
      buttonGroup.className = "btn-group";
      const openBtn = document.createElement("a");
      openBtn.href = image;
      openBtn.target = "_blank";
      openBtn.classList = "btn text-primary";
      openBtn.title = "Open image in a new tab";
      openBtn.innerHTML = `<i class="bi bi-box-arrow-up-right"></i>`;
      buttonGroup.appendChild(openBtn);
      const deleteBtn = document.createElement("button");
      deleteBtn.classList = "btn text-danger";
      deleteBtn.title = "Delete image";
      deleteBtn.innerHTML = `<i class="bi bi-file-earmark-x"></i>`;
      deleteBtn.addEventListener("click", async () => {
        const response = await fetch(
          `/api/products/${product.id}/images/${image.split("/").pop()}`,
          { method: "DELETE" },
        );
        if (response.ok) imageElement.remove();
      });
      buttonGroup.appendChild(deleteBtn);
      imageElement.appendChild(buttonGroup);
      modalImages.appendChild(imageElement);
    }
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
    const oldProductCard = document.getElementById(product.id);
    if (!oldProductCard) {
      return addProductCard(product);
    }
    const newProductCard = createProductCard(product);
    oldProductCard.replaceWith(newProductCard);
  }

  function addProductCard(product) {
    if (!ownsProduct(product)) return;
    const productCard = createProductCard(product);
    productContainer.appendChild(productCard);
  }

  function createProductCard(product) {
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

    const imageUrl = product.thumbnail ?? "";
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
    return card;
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
