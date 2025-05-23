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
    let keys = ["name","sportname"];
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

document.getElementById("playerSearchField").addEventListener("input", function () {
    listPlayers(gPlayers);
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
    input.style.zIndex = "15";

    if(field == "goalteam1" || field == "goalteam2"){
        //de er inne i en beholder ekstra
        cell.parentElement.parentElement.style.zIndex = "10";
    }else{
        cell.parentElement.style.zIndex = "10";
    }
    
    if(type == "datetime-local"){
        input.classList.add("dateholder");
    }else{
        input.classList.add("standardinputfield");
    }

    // Spesifikk behandling for nummer
        // Spesifikk behandling for nummer
        if (type === "number") {
            input.style.maxWidth = "60px";
            if (currentValue === "-" || currentValue.trim() === "") {
                currentValue = "";
                input.value = currentValue;
            } else {
                input.value = parseFloat(currentValue.replace(/[^0-9.-]/g, "")) || 0; // Kun tall
            }
        }


    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-feltet
    cell.parentElement.appendChild(input);
    input.focus();

    // Lagre endringer ved `blur`
    input.addEventListener("blur", () => {


        if(field == "goalteam1" || field == "goalteam2"){
            //de er inne i en beholder ekstra
            cell.parentElement.parentElement.style.zIndex = "5";
        }else{
            cell.parentElement.style.zIndex = "5";
        }


        let newValue = input.value.trim();

        if (newValue !== currentValue) {
            //innholdet er forandret
            let savedata = {};
            if (newValue !== "") {
                if(type === "number"){
                    if (newValue === "-" || newValue.trim() === "") {
                    }else{
                    newValue = parseFloat(newValue.replace(/[^0-9.-]/g, "")) || 0;
                    }
                }

            } else {
                newValue = ""; // Behold tom verdi
            }

            if(type == "datetime-local"){
            cell.textContent = formatDateName(newValue)
            cell.dataset.date = newValue;
            }else{
            cell.textContent = newValue === "" ? "-" : newValue;
            }
            
            savedata[field] = newValue === "" ? null : newValue;
            updateRowData(item.airtable, savedata,tabelid);
            controllAction(item, newValue, field, tabelid, cell);
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
    select.style.position = "relative";
    select.style.zIndex = "15";

    //setter den valgte cellen foran de andre
    if(field == "team1" || field == "team2"){
        //de er inne i en beholder ekstra
        cell.parentElement.parentElement.style.zIndex = "10";
    }else{
        cell.parentElement.style.zIndex = "10";
    }
    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
    
        if (option.text === currentValue) {
            optionElement.selected = true;
        } else if (option.text.includes(currentValue)) {
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
        //sette cellen tilbake til normal z verdi
        if(field == "team1" || field == "team2"){
            //de er inne i en beholder ekstra
            cell.parentElement.parentElement.style.zIndex = "5";
        }else{
            cell.parentElement.style.zIndex = "5";
        }

        const selectedOption = options.find(opt => opt.value.toString() === select.value);

        if (selectedOption && selectedOption.text !== currentValue) {
            let newValue = selectedOption.value;
            let newText = selectedOption.text;
            let savedata = {};
            cell.textContent = newText;
            
            if(field == "typematch" || field == "endplay"){
                savedata[field] = newValue;
            }else if (newValue == ""){
                savedata[field] = null;
            }else{
                savedata[field] = [newValue];
            }

            updateRowData(item.airtable, savedata,tabelid);
            //oppdater evt. ander felt/ iconer på samme rad

            //send denne til kontroll for unik action 
            controllAction(item,newValue,field,tabelid,cell,options);
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

function triggerEditCheckbox(cell,item,field,tabelid){
    let savedata = {};
    const status = cell.checked; 
    savedata[field] = status;
    updateRowData(item.airtable, savedata,tabelid);
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
    }else if (tabelid == "tbljVqkOQACs56QqI"){
        return gPlayers;
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


function controllAction(item, newValue, field, tabelid, cell,options) {
    if (tabelid === "tbl3ta1WZBr6wKPSp" && field === "club") {
        // Dette er lagtabellen som oppdaterer club
        if (newValue !== "") {
        // Finn clubitem
        const clubitem = gClub.find(item => item.airtable === newValue);

        // Oppdater også clubid og clubname lokalt
        item.club = [clubitem.airtable];
        item.clubname = clubitem.name;
        item.clublogo = clubitem.logo;

        // Sett team logo hvis tilgjengelig
        if (clubitem.logo) {
            cell.parentElement.parentElement.querySelector(".teamlogo").src = clubitem.logo;
        }
    }else{
            // Oppdater også clubid og clubname lokalt
            item.club = "";
            item.clubname = "";
            item.clublogo = "";
            cell.parentElement.parentElement.querySelector(".teamlogo").src = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png";   
    }

    }else if(tabelid === "tbl3ta1WZBr6wKPSp" && field === "division") {
        // Finn divisjon
        const divisjon = gDivision.find(item => item.airtable === newValue);

        // Oppdater også lokalt
        item.divisjon = [divisjon.airtable];
        item.divisionname = divisjon.name;

    }else if(tabelid === "tblqf56gcQaGJsBcl" && field === "name") {
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
    }else if(tabelid === "tblrHBFa60aIdqkUu" && (field === "goalteam1" || field === "goalteam2") ){
        //sette 
      //row trenger å kjøres en oppdatering på
      makeNewUpdateRowMatch(item,tabelid,cell);

    }else if(tabelid === "tblrHBFa60aIdqkUu" && (field === "team1" || field === "team2") ){
    //lag forandres på kamp
            // Finn clubitem
            const team = gTeam.find(item => item.airtable === newValue);
            let logoclassElement = ""
            if(field === "team1"){
            // Oppdater også teamId og team1name lokalt
                if(!newValue){
                    item.team1 = "";
                    item.team1name = "";
                    item.team1clublogo = "";
                    //cell.parentElement.parentElement.querySelector(".team1name").textContent = "ingenlag";
                }else{
                item.team1 = team.airtable;
                item.team1name = team.name;
                item.team1clublogo = team.clublogo;
                }
            }else if (field === "team2"){
                if(!newValue){
                    item.team2 = "";
                    item.team2name = "";
                    item.team2clublogo = "";
                    //cell.parentElement.parentElement.querySelector(".team2name").textContent = "ingenlag";
                }else{
                item.team2 = team.airtable;
                item.team2name = team.name;
                item.team2clublogo = team.clublogo;
                }
            }

            //row trenger å kjøres en oppdatering på
            makeNewUpdateRowMatch(item,tabelid,cell);



    }else if(tabelid === "tblrHBFa60aIdqkUu" && (field === "settaa" || field === "settab" || field === "settba" || field === "settbb" || field === "settca" || field === "settcb") ){
        //settverdiene settes i panelet
        item[field] = newValue;
        //row trenger å kjøres en oppdatering på
        makeNewUpdateRowMatch(item,tabelid,cell);
 
    }else if(tabelid === "tblrHBFa60aIdqkUu" && field === "division"){
        //dette er divisjon på laget som settes
        
        // Finn clubitem
        const Division = gDivision.find(item => item.airtable === newValue);

        // Oppdater også clubid og clubname lokalt
        item.division = Division.airtable;
        item.divisionname = Division.name;

        //row trenger å kjøres en oppdatering på
        makeNewUpdateRowMatch(item,tabelid,cell);
         
    }else if(tabelid === "tblrHBFa60aIdqkUu" && field === "group"){
        //dette er gruppe
        const Group = gGroups.find(item => item.airtable === newValue);
        // Oppdater også clubid og clubname lokalt
        if(Group){
        item.group = [Group.airtable];
        item.groupname = Group.name;
        }else{
            item.group = "";
            item.groupname = ""
        }
        //row trenger å kjøres en oppdatering på
        makeNewUpdateRowMatch(item,tabelid,cell);


    }else if(tabelid === "tblrHBFa60aIdqkUu" && field === "typematch"){
        //dette type kamp settes
         // Oppdater også clubid
        item.typematch = newValue;
        //row trenger å kjøres en oppdatering på
        makeNewUpdateRowMatch(item,tabelid,cell);
    }else if(tabelid === "tblrHBFa60aIdqkUu" && (field === "placeholderteam1" || field === "placeholderteam2")  ){
        //row trenger å kjøres en oppdatering på
        makeNewUpdateRowMatch(item,tabelid,cell);
    }else if(tabelid === "tbljVqkOQACs56QqI" && field === "team"){
        //dette er på spilleren
        // Oppdater også teamid og teamname lokalt
        const team = gTeam.find(item => item.airtable === newValue);
        item.team = [team.airtable];
        item.teamname = team.name;
        item.divisionname = team.divisionname;
        item.groupname = team.groupname;
        item.teamclubname = team.clubname;
        item.club = team.club;

        makeNewUpdateRowPlayer(item,tabelid,cell);
        
    }
}



function findParentWithResultatCell(element,className) {
    while (element) {
      // Sjekk om elementet inneholder et barn med klassen "resultatcell"
      if (element.querySelector(className)) {
        return element; // Returner det første foreldreelementet som oppfyller betingelsen
      }
      element = element.parentElement; // Fortsett oppover i DOM-treet
    }
    return null; // Returner null hvis ingen foreldre matcher
}

function findParentWithClass(element, className) {
    while (element) {
        // Sjekk om elementet selv har klassen
        if (element.classList && element.classList.contains(className)) {
            return element; // Returnerer elementet hvis det har klassen
        }

        // Sjekk om elementet inneholder et barn med klassen
        if (element.querySelector && element.querySelector(`.${className}`)) {
            return element; // Returnerer elementet hvis det inneholder et barn med klassen
        }

        // Fortsett oppover i DOM-treet
        element = element.parentElement;
    }
    return null; // Returnerer null hvis ingen elementer matcher
}

function makeNewUpdateRowMatch(item,tabelid,cell){

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".matchrow");
    let open = false;
    const rowelement = findParentWithClass(cell, "standardlistrow");
    if(rowelement.querySelector(".allinfomatch").style.display === "block"){
        open = true;  
    }
    const newRow = makeMatchrow(nodeelement,item,tabelid,open);
    //row trenger å kjøres en oppdatering på
    rowelement.parentElement.insertBefore(newRow, rowelement.nextSibling);
    rowelement.remove();
}

    
function makeNewUpdateRowPlayer(item,tabelid,cell){

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".playerrow");

    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;
    
    //filtrer lagene for dropdown 
    let oTeam = gTeam.filter(team => {
        const matchesDivision = !divisionValue || team.division === divisionValue;
        const matchesGroup = !groupValue || team.group === groupValue;
        return matchesDivision && matchesGroup;
    });
    oTeam = convertTeamArrayToOptions(oTeam);

    const rowelement = findParentWithClass(cell, "standardlistrow");
    const newRow = makePlayerrow(nodeelement,item,tabelid,oTeam);
    //row trenger å kjøres en oppdatering på
    rowelement.parentElement.insertBefore(newRow, rowelement.nextSibling);
    rowelement.remove();

    }