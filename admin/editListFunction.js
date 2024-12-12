//difinerer søkefelt
document.getElementById("tournamentSearchField").addEventListener("input", function () {
    let keys = ["name","organizername"];
    const filterdata = filterSearchList(this.value, gTournament, keys);
    listTournament(filterdata);
});

document.getElementById("organizerSearchField").addEventListener("input", function () {
    let keys = ["name"];
    const filterdata = filterSearchList(this.value, gOrganizer, keys);
    listOrganizer(filterdata);
});

document.getElementById("clubSearchField").addEventListener("input", function () {
    let keys = ["name"];
    const filterdata = filterSearchList(this.value, gClub, keys);
    listClub(filterdata);
});

document.getElementById("teamSearchField").addEventListener("input", function () {
    let keys = ["name","initials"];
    const filterdata = filterSearchList(this.value, gTeam, keys);
    listTeams(filterdata);
});

document.getElementById("MatchSearchField").addEventListener("input", function () {
    let keys = ["team1name","team2name","placeholderteam1","placeholderteam2","refereename"];
    const filterdata = filterSearchList(this.value, gMatchs, keys);
    listMatch(filterdata);
});
//

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

function triggerEditInput(cell, item, field,type, tabelid) {

    //henter tekstverdien
    let currentValue = cell.textContent.trim();

    // Hindre flere input-felt
    if (cell.querySelector("input")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    // Opprett input-felt
    const input = document.createElement("input");
    input.type = type;
    input.value = currentValue;
    input.classList.add("standardinputfield");
    
    if (type === "number") {
        currentValue = 
        input.value = parseFloat(currentValue.replace(/[^0-9.-]/g, "")) || 0; //kun tall
    }

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-feltet
    cell.parentElement.appendChild(input);
    input.focus();

    // Lagre endringer ved `blur`
    input.addEventListener("blur", () => {
        let newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            //innholdet er forandret
            let savedata = {};
            if (type === "number") {
                newValue = parseFloat(newValue.replace(/[^0-9.-]/g, "")) || 0;
            }

            cell.textContent = newValue;
            savedata[field] = newValue;
            updateRowData(item.airtable, savedata,tabelid);
        }

        // Fjern input-feltet og vis cellen med den opprinnelige display-verdi
        input.remove();
        cell.style.display = originalDisplay;
    });

    // Lagre endringer ved `Enter` og avbryt ved `Escape`
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            input.blur(); // Trigger `blur`-hendelsen
        } else if (e.key === "Escape") {
            // Avbryt redigeringen
            input.remove();
            cell.style.display = originalDisplay;
        }
    });
}








/// feller for alle typer inputs
function rutingArrayName(tabelid){
    if(tabelid == "tblGhVlhWETNvhrWN"){
        return gTournament;
    }
return [];

}

function updateRowData(itemId, savedata,tabelid) {
//finne riktig object i riktig array

const item = rutingArrayName(tabelid).find(item => item.airtable === itemId);

    if (item) {
        // Oppdater lokalt
        for (const [field, value] of Object.entries(savedata)) {
            item[field] = value;
        }

        // Oppdater på server
        saveToServer(itemId, savedata, tabelid);
  
    } else {
        console.error(`ID ${itemId} ikke funnet.`);
    }
}

function saveToServer(itemId, savedata, tabelid) {
    
    // Lag en kopi av fieldValue for modifikasjon
    const updatedFieldValue = { ...savedata };

    const body = JSON.stringify(updatedFieldValue);
    PATCHairtable(
        baseId, // App ID
        tabelid, // Tabell ID
        itemId,          // Company ID
        body,           // JSON-data
        "respondsaveToServer" // Callback eller responshåndtering
    );

    console.log(`Oppdatering sendt til server for ID: ${itemId}, Data: ${body}`);
}

function respondsaveToServer(data){

console.log(data);

}