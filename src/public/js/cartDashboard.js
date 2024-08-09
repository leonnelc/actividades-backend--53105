const itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let q = "";
const searchBar = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");
const searchIcon = document.getElementById("searchIcon");
const searchSpinner = document.getElementById("searchSpinner");
searchForm.addEventListener("submit", search);

function fetchData(page) {
  toggleSearchSpinner();
  fetch(`/api/carts?page=${page}&limit=${itemsPerPage}&q=${q}`)
    .then((response) => response.json())
    .then((data) => {
      displayData(data.items);
      updatePagination(data.page, data.totalPages);
      currentPage = data.page;
      totalPages = data.totalPages;
    })
    .catch((error) => console.error("Error:", error))
    .finally(toggleSearchSpinner);
}

function toggleSearchSpinner() {
  if (searchIcon.classList.contains("d-none")) {
    searchIcon.classList.remove("d-none");
    searchSpinner.classList.add("d-none");
  } else {
    searchIcon.classList.add("d-none");
    searchSpinner.classList.remove("d-none");
  }
}

function search(event) {
  event.preventDefault();
  q = searchBar.value;
  fetchData(1);
}

function clearCart(cid) {
  fetch(`/api/carts/${cid}`, { method: "DELETE" })
    .then((response) => {
      response
        .json()
        .then((data) =>
          appendAlert(data.message, response.ok ? "success" : "danger", 2500),
        );
      if (response.ok) fetchData(currentPage);
    })
    .catch((error) => console.error("Error:", error));
}

function displayData(items) {
  const container = document.getElementById("data-container");
  container.innerHTML = "";
  items.forEach((item) => {
    const div = document.createElement("div");
    div.id = item.id;
    div.className = "card mb-2 bg-dark-subtle border-0";
    div.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${item.owner}</h5>
                  <p class="card-text">${item.products.length} product${item.products.length != 1 ? "s" : ""}</p>
                  <p class="card-text">$ ${item.total}</p>
                  <button class="btn btn-danger mb-1" onclick=javascript:clearCart("${item.id}")>Clear cart</button>
                  <a class="btn btn-secondary mb-1" href="/carts/${item.id}">Browse cart</a>
            </div>
        `;
    container.appendChild(div);
  });
  if (container.innerHTML == "") {
    container.innerHTML = "No carts found";
  }
}

function updatePagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const paginationRange = 3; // Number of page numbers to display around the current page

  // Previous button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML =
    '<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>';
  prevLi.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) fetchData(currentPage - 1);
  });
  pagination.appendChild(prevLi);

  // Page numbers
  let startPage = Math.max(currentPage - Math.floor(paginationRange / 2), 1);
  let endPage = Math.min(startPage + paginationRange - 1, totalPages);

  if (endPage - startPage + 1 < paginationRange) {
    startPage = Math.max(totalPages - paginationRange + 1, 1);
    endPage = totalPages;
  }

  if (startPage > 1) {
    const firstPageLi = document.createElement("li");
    firstPageLi.className = "page-item";
    firstPageLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
    firstPageLi.addEventListener("click", (e) => {
      e.preventDefault();
      fetchData(1);
    });
    pagination.appendChild(firstPageLi);

    if (startPage > 2) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(ellipsisLi);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      fetchData(parseInt(e.target.dataset.page));
    });
    pagination.appendChild(li);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
      pagination.appendChild(ellipsisLi);
    }

    const lastPageLi = document.createElement("li");
    lastPageLi.className = "page-item";
    lastPageLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
    lastPageLi.addEventListener("click", (e) => {
      e.preventDefault();
      fetchData(parseInt(e.target.dataset.page));
    });
    pagination.appendChild(lastPageLi);
  }

  // Next button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextLi.innerHTML =
    '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
  nextLi.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) fetchData(currentPage + 1);
  });
  pagination.appendChild(nextLi);
}

// Initial fetch
fetchData(currentPage);
