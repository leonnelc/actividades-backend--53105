function queryRedirect(query, value){
    // Sets a query and redirects, keeping the other queries. Deletes the query if value is empty.
    let params = new URLSearchParams(window.location.search);
    params.set(query, value);
    if (value == ""){
        params.delete(query);
    }
    window.location.search = params.toString();
}
const sortSelector = document.getElementById("sort-selector");
sortSelector.value = new URLSearchParams(window.location.search).get("sort") ?? "";
sortSelector.onchange = (event) => {
    queryRedirect("sort", event.target.value);
}