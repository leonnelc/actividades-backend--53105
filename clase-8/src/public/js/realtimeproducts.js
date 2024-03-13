const socket = io();

function deleteProduct(id){
    socket.emit("deleteProduct", id);
}
function addProduct(){
    console.log("Adding product");
    const title = document.getElementById("formTitle");
    const description = document.getElementById("formDescription");
    const price = document.getElementById("formPrice");
    const thumbnails = document.getElementById("formThumbnails");
    const code = document.getElementById("formCode");
    const stock = document.getElementById("formStock");
    const category = document.getElementById("formCategory");
    const status = document.getElementById("formStatus");
    const product = {
        title:title.value,
        description:description.value,
        price:price.value,
        thumbnails:[thumbnails.value],
        code:code.value,
        stock:stock.value,
        category:category.value,
        status:status.value
    }
    socket.emit("addProduct", product);
}
const productContainer = document.getElementById("product-container");
socket.on("productList", (products) => {
  productContainer.innerHTML = "";

  products.forEach(product => {

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
    product.thumbnails.forEach(thumbnail => {
      const img = document.createElement("img");
      img.src = thumbnail;
      thumbnails.appendChild(img);
    });
    card.appendChild(thumbnails);


    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => {
        deleteProduct(product.id);
    }
    card.appendChild(deleteButton);

    const decreaseButton = document.createElement("button");
    decreaseButton.textContent = "-";
    decreaseButton.onclick = () => {
        socket.emit("decStock", product.id);
    }
    card.appendChild(decreaseButton);

    const increaseButton = document.createElement("button");
    increaseButton.textContent = "+";
    increaseButton.onclick = () => {
        socket.emit("addStock", product.id);
    }
    card.appendChild(increaseButton);
  

    productContainer.appendChild(card);
  });
  
})