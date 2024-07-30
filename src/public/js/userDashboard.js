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
  fetch(`/api/users?page=${page}&limit=${itemsPerPage}&q=${q}`)
    .then((response) => response.json())
    .then((data) => {
      displayData(data.items);
      updatePagination(data.currentPage, data.totalPages);
      currentPage = data.currentPage;
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

function formatDate(dateTime) {
  const seconds = dateTime / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  const format = (string, time, mod) => {
    if (!mod) mod = Infinity;
    return `${time >= 1 ? (time % mod).toFixed() : ""} ${time >= 1 ? string : ""}`;
  };
  const fDays = format("days", days);
  const fHours = format("hours", hours, 24);
  const fMinutes = format("minutes", minutes, 60);
  const formatted = `${fDays} ${fHours} ${fMinutes}`;
  return formatted.trim() == `` ? "Less than a minute ago" : `${formatted} ago`;
}

function editRole(id, role) {
  fetch(`/api/users/${id}/role/${role}`, { method: "PUT" })
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

function deleteInactiveUsers() {
  fetch(`/api/users`, { method: "DELETE" })
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

function deleteUser(id) {
  fetch(`/api/users/${id}`, { method: "DELETE" })
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
                <h5 class="card-title">${item.first_name}</h5>
              <div class="row">
                <div class="col-8">
                  <p class="card-text">${item.email}</p>
                </div>
                <div class="col-4 d-flex justify-content-end">
                  <button class="btn btn-danger mb-1" onclick=javascript:deleteUser("${item.id}")>Delete user</button>
                </div>
              </div>
              <div class="row">
                <div class="col-8">
                  <p class="card-text">${item.role}</p>
                </div>
                <div class="col-4 d-flex justify-content-end">
                  <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton${item.id}" data-bs-toggle="dropdown" aria-expanded="false">Edit role</button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${item.id}">
                      <li><a class="dropdown-item" href="#" onclick="editRole('${item.id}', 'user')">User</a></li>
                      <li><a class="dropdown-item" href="#" onclick="editRole('${item.id}', 'premium')">Premium</a></li>
                    </ul>
                  </div>
                </div>
              </div>
                <p class="card-text">Last login: ${formatDate(new Date() - new Date(item.last_connection))}</p>
            </div>
        `;
    container.appendChild(div);
  });
  if (container.innerHTML == "") {
    container.innerHTML = "No users found";
  }
}

function updatePagination(currentPage, totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

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
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      fetchData(i);
    });
    pagination.appendChild(li);
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
