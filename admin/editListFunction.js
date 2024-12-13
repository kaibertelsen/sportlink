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
    if(type == "datetime-local"){
        currentValue = cell.dataset.date || cell.textContent.trim();
    }

    // Hindre flere input-felt
    if (cell.querySelector("input")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    // Opprett input-felt
    const input = document.createElement("input");
    input.type = type;
    input.value = currentValue;
    input.style.position = "relative";
    input.style.zIndex = "10";
    
    if(type == "datetime-local"){
        input.classList.add("dateholder");
    }else{
        input.classList.add("standardinputfield");
    }

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

            if(type == "datetime-local"){
            cell.textContent = formatDateName(newValue)
            cell.dataset.date = newValue;
            }else{
            cell.textContent = newValue;
            }
            
            savedata[field] = newValue;
            updateRowData(item.airtable, savedata,tabelid);
        }

        // Fjern input-feltet og vis cellen med den opprinnelige display-verdi
        input.remove();
        if (originalDisplay === "none" || originalDisplay === "") {
            cell.style.display = "block";
        } else {
            cell.style.display = originalDisplay;
        }
        
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

function triggerEditDropdown(cell, item, field, options, tabelid) {
    const currentValue = cell.textContent.trim();

    // Hindre flere dropdowns
    if (cell.querySelector("select")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    const select = document.createElement("select");
    select.classList.add("standarddropdowninput");
    
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;

        if (option.text === currentValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    // Skjul cellen
    cell.style.display = "none";

    // Legg til dropdown i foreldre-elementet
    cell.parentElement.appendChild(select);
    select.focus();

    // Lagre endringer ved `blur`
    select.addEventListener("blur", () => {
        const selectedOption = options.find(opt => opt.value.toString() === select.value);

        if (selectedOption && selectedOption.text !== currentValue) {
            let newValue = selectedOption.value;
            let newText = selectedOption.text;
            let savedata = {};
            cell.textContent = newText;
            savedata[field] = [newValue];
            updateRowData(item.airtable, savedata,tabelid);
            //oppdater evt. ander felt/ iconer på samme rad

            //send denne til kontroll for unik action 
            controllAction(item,newValue,field,tabelid,cell);
        }

        // Fjern dropdown og vis cellen med den opprinnelige display-verdi
        select.remove();

        if (originalDisplay === "none" || originalDisplay === "") {
            cell.style.display = "block";
        } else {
            cell.style.display = originalDisplay;
        }
    });

    // Håndter tastetrykk (Enter for lagring, Escape for avbryt)
    select.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            select.blur(); // Trigger `blur`-hendelsen
        } else if (e.key === "Escape") {
            // Avbryt redigeringen
            select.remove();

            if (originalDisplay === "none" || originalDisplay === "") {
                cell.style.display = "block";
            } else {
                cell.style.display = originalDisplay;
            }
        }
    });
}

/// feller for alle typer inputs
function rutingArrayName(tabelid){
    if(tabelid == "tblGhVlhWETNvhrWN"){
        return gTournament;
    }else if(tabelid=="tblqf56gcQaGJsBcl"){
        return gClub;
    }else if(tabelid== "tbl4bHhV4Bnbz8I3r"){
        return gOrganizer;
    }else if (tabelid == "tbl3ta1WZBr6wKPSp"){
        return gTeam;
    }else if (tabelid == "tblY9xnfQ1y8dXTaA"){
        return gDivision;
    }else if (tabelid == "tblrHBFa60aIdqkUu"){
        return gMatchs;
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


function controllAction(item, newValue, field, tabelid, cell) {
    if (tabelid === "tbl3ta1WZBr6wKPSp" && field === "club") {
        // Dette er lagtabellen som oppdaterer club
        
        // Finn clubitem
        const clubitem = gClub.find(item => item.airtable === newValue);

        // Oppdater også clubid og clubname lokalt
        item.club = [clubitem.airtable];
        item.clubname = clubitem.name;

        // Sett team logo hvis tilgjengelig
        if (clubitem.logo) {
            cell.parentElement.parentElement.querySelector(".teamlogo").src = clubitem.logo;
        }

    } else if (tabelid === "tbl3ta1WZBr6wKPSp" && field === "division") {
        // Finn divisjon
        const divisjon = gDivision.find(item => item.airtable === newValue);

        // Oppdater også lokalt
        item.divisjon = [divisjon.airtable];
        item.divisionname = divisjon.name;

    } else if (tabelid === "tblqf56gcQaGJsBcl" && field === "name") {
        // Oppdater alle lag som er med i denne klubben
        
        // Finn alle lag i gTeam som tilhører denne klubben
        const teamsInClub = gTeam.filter(team => 
            team.club && team.club.includes(item.airtable)
        );

        for (let team of teamsInClub) {
            // Oppdater nøkkelfeltene club, clubname og clublogo
            team.club = [item.airtable];
            team.clubname = item.name;
            team.clublogo = item.logo;
        }
    }
}
