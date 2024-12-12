
// Legg til en event listener på søkefeltet
document.getElementById("tournamentSearchField").addEventListener("input", function () {
    let keys = ["name"];
    const filterdata = filterSearchList(this.value, gTournament, keys);
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