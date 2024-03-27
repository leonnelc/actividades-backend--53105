function queryRedirect(queries, values){
    // Sets queries and redirects, keeping the other queries. Deletes the query if value is empty.
    let params = new URLSearchParams(window.location.search);
    for (i in queries){
        params.set(queries[i], values[i]);
        if (values[i] == ""){
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
}
categorySelector.onchange = (event) => {
    queryRedirect(["query"], [event.target.value != "" ?`{"category":"${event.target.value}"}`: ""]);
}

function addToCart(id){
    alert("Not implemented yet");
}