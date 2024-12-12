
document.getElementById("tournamentSearchField").addEventListener("input", function () {
    let keys = ["name","organizername"];
    const filterdata = filterSearchList(this.value, gTournament, keys);
    listTournament(filterdata);
});

document.getElementById("organizerSearchField").addEventListener("input", function () {
    let keys = ["name"];
    const filterdata = filterSearchList(this.value, gOrganizer, keys);
    listTournament(filterdata);
});





// Filterfunksjon for søk i input text field
function filterSearchList(searchValue, array, keys) {
    const searchQuery = searchValue.toLowerCase();

    // Filtrer arrayet basert på om noen av nøklene matcher søket
    return array.filter(item => 
        keys.some(key => 
            item[key] && item[key].toLowerCase().includes(searchQuery)
        )
    );
}