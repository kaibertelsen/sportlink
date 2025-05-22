var copyMatchElementholder;
var copyTeamElementholder;
var copyDivisionElement;
var alertMessage;

document.getElementById('matchtabbutton').onclick = function() {
    listMatch(gMatchs); 
}

document.getElementById('teamtabbutton').onclick = function() {
    listTeams(gTeam); 
}

document.getElementById('createNewMatch').onclick = function() {
    createNewMatch(); 
}

document.getElementById('createNewTeam').onclick = function() {
    createNewTeam(); 
}
function loadTurnamentSelector(tournaments) {
    // Finn dropdown-elementet
    const selector = document.getElementById("tournamentSelector");

    // Fjern eksisterende valg for å starte med en tom liste
    selector.innerHTML = "";

    // Sorter turneringer alfabetisk basert på navn
    tournaments.sort((a, b) => a.name.localeCompare(b.name, 'nb', { sensitivity: 'base' }));

    // Gå gjennom alle turneringer og legg dem til i dropdown
    tournaments.forEach(tournament => {
        // Opprett et nytt <option>-element
        const option = document.createElement("option");
        option.textContent = tournament.name; // Sett tekst som turneringsnavn
        option.value = tournament.airtable;   // Sett verdi som airtable-id

        // Legg til <option> i <select>
        selector.appendChild(option);
    });

    // Legg til en eventlistener for når verdien endres
    selector.addEventListener("change", () => {
        const selectedValue = selector.value;
        const selectedText = selector.options[selector.selectedIndex].text;
        onTournamentSelected(selectedValue, selectedText);
    });

}

function onTournamentSelected(airtableId, tournamentName) {
    console.log("Valgt turnering:", tournamentName, "med Airtable ID:", airtableId);
    openTournament(airtableId);
    

}

function openTournament(Tournamentid){
    // Klikk på tournament-knapp
    document.getElementById("tournamenttabbutton").click();

    //
    document.getElementById("tournamenttabbutton").style.display = "inline-block";

    //hvis loader
    document.getElementById("loadingholdertournament").style.display = "block";
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");

    //tøm listene
    document.getElementById("divisionlistholder").replaceChildren();
    document.getElementById("teamlistholder").replaceChildren();
    document.getElementById("matchlistholder").replaceChildren();

    //skjul gruppeselectorer
    document.getElementById("groupSelector").style.display = "none";
}

function responsGetTournament(data) {
    console.log(data.fields);
    //skul loader
    document.getElementById("loadingholdertournament").style.display = "none";
    document.getElementById("tournamentinfopage").style.display = "block";

    // Hent tournament-data
    const tournament = data.fields;
    activetournament = tournament;
   
    // Oppdater turneringsinformasjon
    updateTournamentInfo(tournament);

    // Konverter divisjoner og liste dem opp
    const divisions = convertJSONrow(tournament.divisjonjson);
    gDivision = divisions;
    listDivision(gDivision);

    const teams = convertJSONrow(tournament.teamjson);
    gTeam = teams;
    listTeams(gTeam);
    //last opp lagene i teamSelector
    loadTeamSelector(gTeam);

    const players = generatePlayerFromTeams(teams);
    gPlayers = players;
    listPlayers(gPlayers);

    const matchs = convertJSONrow(tournament.matchjson);
    gMatchs = matchs;
    listMatch(matchs);

    

    //list opp ale unike location i kampene
    loadLocationSelector(gMatchs);

    

}

function loadTeamSelector(teams) {

    //filter lag basert på valgt divisjon og gruppe
    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;
    const filteredTeams = teams.filter(team => {
        const matchesDivision = !divisionValue || team.division === divisionValue;
        const matchesGroup = !groupValue || team.group === groupValue;
        return matchesDivision && matchesGroup;
    });

    // Sort teams alphabetically by name
    filteredTeams.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB); // Alphabetical order
    });

    //list opp alle lag i teamSelector
    const teamSelector = document.getElementById("teamSelector");
    teamSelector.replaceChildren(); // Clear previous options
    const defaultOptionTeam = document.createElement("option");
    defaultOptionTeam.value = "";
    defaultOptionTeam.textContent = "Alle lag";
    teamSelector.appendChild(defaultOptionTeam);
    for (let team of filteredTeams) {
        let teamnavnDivisjon = team.name;
        if (team.divisionname) {
            teamnavnDivisjon += " (" + team.divisionname + ")";
        }
        if (team.groupname) {
            teamnavnDivisjon += " - " + team.groupname;
        }
        // Legg til lagreferanse i laget
        const option = document.createElement("option");
        option.textContent = teamnavnDivisjon || "Ukjent navn";
        option.value = team.airtable;
        teamSelector.appendChild(option);
    }



}

function listPlayers(players) {
    // Get selected values from division and group selectors
    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;
    const teamSelector = document.getElementById("teamSelector");
   

    // Filter players based on selected division and group
    const filteredPlayers = players.filter(player => {
        const matchesDivision = !divisionValue || player.division === divisionValue;
        const matchesGroup = !groupValue || player.group === groupValue;
        const matchesTeam = !teamSelector.value || player.team === teamSelector.value;
        return matchesDivision && matchesGroup && matchesTeam;
    });

    // Sort players alphabetically by name
    filteredPlayers.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB); // Alphabetical order
    });
    // Get the list holder and clear previous content
    const list = document.getElementById("playerlistholder");
    list.replaceChildren(); // Clear previous content

    // Update row counter
    list.parentElement.querySelector(".rowcounter").textContent = `${filteredPlayers.length} stk.`;
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".playerrow");
    for (let player of filteredPlayers) {
        const playerrow = makePlayerrow(nodeelement,player);
        list.appendChild(playerrow);
    }
}

function makePlayerrow(nodeelement,player){
    let rowelement = nodeelement.cloneNode(true);
    rowelement.id = player.airtable+"playerrow";
    // Set player logo if available
    if (player.playerlogo) {    
        const playerLogo = rowelement.querySelector(".playerlogo");
        playerLogo.src = player.playerlogo;
        playerLogo.alt = player.name || "Ukjent spiller";
    }

    // Set player details
    const playerName = rowelement.querySelector(".name")
    playerName.textContent = player.name || "Ukjent navn";

    const platerNr = rowelement.querySelector(".nr")
    platerNr.textContent = player.nr || "-";

    const playerTeamName = rowelement.querySelector(".team");
    playerTeamName.textContent = player.teamname || "Ukjent lag";

    const playerClubName = rowelement.querySelector(".club");
    playerClubName.textContent = player.clubname || "Ukjent klubb";

    const playerDivisionName = rowelement.querySelector(".division");
    playerDivisionName.textContent = player.divisionname || "Ukjent divisjon";

    const playerGroupName = rowelement.querySelector(".groupname");
    playerGroupName.textContent = player.groupname || "-";

    const deletebutton = rowelement.querySelector(".deletebutton");
    deletebutton.onclick = function () {
        const confirmation = window.confirm("Ønsker du å slette denne spilleren?");
        if (confirmation) {
            DELETEairtable(baseId,"tbl3ta1WZBr6wKPSp",player.airtable,"playerdeletedresponse");
            rowelement.remove();
        } else {
        console.log("Sletting avbrutt.");
        }
    }

    return rowelement;
}



function generatePlayerFromTeams(teams) {
    let players = [];
    for (let team of teams) {
        if (team.player) {
            for (let player of team.player) {
                // Legg til lagreferanse i spilleren
                player.team = team.airtable;
                player.teamname = team.name;
                player.clubname = team.clubname;
                player.clublogo = team.clublogo;
                player.division = team.division;
                player.groupname = team.groupname;
                player.group = team.group;
                player.divisionname = team.divisionname;
                players.push(player);
            }
        }
    }

    return players;
}

function loadLocationSelector(gMatchs) {
    let uniclocations = [];

    // Finn unike location-verdier
    for (let match of gMatchs) {
        if (match.location && !uniclocations.includes(match.location)) {
            uniclocations.push(match.location);
        }
    }

    // Hent select-elementet
    const locationSelector = document.getElementById("locationSelector");

    // Tøm eksisterende options
    locationSelector.innerHTML = "";

    // Legg til en standard tom option (valgfritt)
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Velg sted";
    defaultOption.value = "";
    locationSelector.appendChild(defaultOption);

    // Legg til unike locations som options
    for (let location of uniclocations) {
        const option = document.createElement("option");
        option.textContent = location;
        option.value = location;
        locationSelector.appendChild(option);
    }
}


function updateTournamentInfo(tournament) {

const tournamentinfoheader = document.getElementById("tournamentinfoheader");
    //tabelid for lagring lokalt og på server
    let tabelid = "tblGhVlhWETNvhrWN";

    const tournamentName = tournamentinfoheader.querySelector(".tournamentname");

    // Oppdater turneringsnavn
    tournamentName.textContent = tournament.name || "Ukjent turnering";
    
    // Fjern tidligere event listeners ved å klone elementet
    const newTournamentName = tournamentName.cloneNode(true);
    tournamentName.parentNode.replaceChild(newTournamentName, tournamentName);
    newTournamentName.addEventListener("click", () => 
        triggerEditInput(newTournamentName, tournament, "name", "text", tabelid)
    );

    tournamentinfoheader.querySelector(".tournamenticon").src = tournament.icon || "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png";
    const SportName = tournamentinfoheader.querySelector(".sportname");
            SportName.textContent = tournament.sportname[0] || "Ukjent sport";
            let SportOptions = convertArrayToOptions(gSport,"name","airtable");
            SportName.addEventListener("click", () => triggerEditDropdown(SportName, tournament, "sport", SportOptions, tabelid));


    const startDate = tournamentinfoheader.querySelector(".startdate");
            if(tournament.startdate){
                startDate.textContent = formatIsoDateName(tournament.startdate);
            }else{
                startDate.textContent = "Ukjent startdato";
            }
            startDate.dataset.date = formatIsoDateValue(tournament.startdate);
            startDate.addEventListener("click", () => triggerEditInput(startDate, tournament, "startdate", "datetime-local", tabelid));
    
    const endDate = tournamentinfoheader.querySelector(".enddate");
            if(tournament.enddate){
               endDate.textContent = formatIsoDateName(tournament.enddate)
            }else{
                endDate.textContent = "Ukjent sluttdato";
            }
            endDate.dataset.date = formatIsoDateValue(tournament.enddate);
            endDate.addEventListener("click", () => triggerEditInput(endDate, tournament, "enddate", "datetime-local", tabelid));

    const eventName = tournamentinfoheader.querySelector(".eventname");
            eventName.textContent = tournament.organizername[0] || "Ukjent Arrangement";
            let Organizeroptions = convertArrayToOptions(gOrganizer,"name","airtable");
            eventName.addEventListener("click", () => triggerEditDropdown(eventName, tournament, "organizer", Organizeroptions, tabelid));

    tournamentinfoheader.querySelector(".username").textContent = tournament.username || "";

    const switsj = document.getElementById("publichswitsj");
    switsj.checked = !tournament?.hidden;

    const statswitsj = document.getElementById("statsswitsj");
    statswitsj.checked = tournament?.statistics;

    

}

function publishTournament() {
    const Pswitch = document.getElementById("publichswitsj");
   
   let message = "Er du sikker på at du vil publisere denne turneringen?";
    if(!Pswitch.checked){
        message = "Er du sikker på at du vil avpublisere denne turneringen?"; 
    }

    // Vis en bekreftelsesdialog
    const userConfirmation = confirm(message);
    
    // Sjekk brukerens valg
    if (userConfirmation) {
        sendPublishRequest();
    } else {
        // Brukeren trykket Avbryt
        console.log("Publisering avbrutt.");
    }
}

function settstatistics(){

    const Pswitch = document.getElementById("statsswitsj");
    let body = {statistics:Pswitch.checked};
    PATCHairtable(baseId,"tblGhVlhWETNvhrWN",activetournament.airtable,JSON.stringify(body),"respondPublish")

}

function sendPublishRequest() {

    const Pswitch = document.getElementById("publichswitsj");
    let hidden = false;
    if(Pswitch.checked){
        hidden = false;
    }else{
        hidden = true; 
    }

    let body = {hidden:hidden};
    PATCHairtable(baseId,"tblGhVlhWETNvhrWN",activetournament.airtable,JSON.stringify(body),"respondPublish")

}

function respondPublish(data){
    const tournament = data.fields;
    activetournament = tournament;
}

function divisionSelectorChange() {
    
    let divId = document.getElementById("divisionSelector").value;

    // Populate the groupSelector dropdown
    const groupSelector = document.getElementById("groupSelector");

    if (divId === "") {
        // Hide group selector if no division is selected
        groupSelector.style.display = "none";
        groupSelector.replaceChildren(); // Clear previous options

        // Add default option with division name
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Alle grupper`;
        groupSelector.appendChild(defaultOption);

    } else {
        // Find groups associated with the division
        const groups = findGroupByDivision(divId);

        // Find the division name from gDivision
        const division = gDivision.find(div => div.airtable === divId);
        const divisionName = division ? division.name : "divisjon";

        // Show the group selector
        groupSelector.style.display = "block";
        groupSelector.replaceChildren(); // Clear previous options

        // Add default option with division name
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Alle grupper`;
        groupSelector.appendChild(defaultOption);

        // Add group options
        groups.forEach(group => {
            const option = document.createElement("option");
            option.value = group.airtable;
            option.textContent = group.name || "Ukjent navn";
            groupSelector.appendChild(option);
        });
    }

        listTeams(gTeam);
        listMatch(gMatchs); 
        listPlayers(gPlayers);
        loadTeamSelector(gTeam);
}

function groupSelectorChange(){
        listMatch(gMatchs);
        listTeams(gTeam);
        listPlayers(gPlayers);
        loadTeamSelector(gTeam);

        
}

function endplaySelectorChange(){
    listMatch(gMatchs);
}

function statusSelectorChange(){
    listMatch(gMatchs);
}


function locationSelectorChange(){
    listMatch(gMatchs);
}

function findGroupByDivision(divisionId) {
    // Find the division object in `gDivision` array by `divisionId`
    let division = gDivision.find(div => div.airtable === divisionId);

    // Return groups if division is found, otherwise return an empty array
    return division ? division.group || [] : [];
}

function listDivision(divisions) {
    const list = document.getElementById("divisionlistholder");
    list.replaceChildren(); // Clear previous content

    list.parentElement.querySelector(".rowcounter").textContent = `${divisions.length} stk.`;
    let tabelid = "tblY9xnfQ1y8dXTaA";
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisionrow");

    // Clear and prepare selectors
    const divisionSelector = document.getElementById("divisionSelector");
    divisionSelector.replaceChildren();

    // Add default option "Alle divisjoner"
    const defaultOptionTeam = document.createElement("option");
    defaultOptionTeam.value = "";
    defaultOptionTeam.textContent = "Alle divisjoner";
    divisionSelector.appendChild(defaultOptionTeam);
    gGroups = [];

    for (let division of divisions) {
         list.appendChild(makeDivisionRow(nodeelement,division));
    }
}

function makeDivisionRow(nodeelement,division){

    let tabelid = "tblY9xnfQ1y8dXTaA";

    const rowelement = nodeelement.cloneNode(true);
    const divisionName = rowelement.querySelector(".name")
    divisionName.textContent = division.name || "Ukjent navn";
    divisionName.addEventListener("click", () => triggerEditInput(divisionName, division, "name", "text", tabelid));

    // Add groups
    const groupNode = rowelement.querySelector(".group");
    division.group.forEach(group => {
        const groupElement = groupNode.cloneNode(true);
        groupElement.querySelector(".groupname").textContent = group.name;
        groupNode.parentElement.appendChild(groupElement);
        gGroups.push(group);
    });
    groupNode.style.display = "none";

    //add new group
    const addnewbutton = rowelement.querySelector(".newgroup");
    addnewbutton.addEventListener("click",() => createNewGroup(division,rowelement));

    // Add endplay
    const endNode = rowelement.querySelector(".endplay");
    division.endplay.forEach(endplay => {
        const endElement = endNode.cloneNode(true);
        endElement.querySelector(".endname").textContent = endplay.endplayname;
        endElement.querySelector(".endcount").textContent = endplay.finalecount;
        endNode.parentElement.appendChild(endElement);
    });
    endNode.style.display = "none";

    // Populate selectors with options
    const optionTeam = document.createElement("option");
    optionTeam.value = division.airtable;
    optionTeam.textContent = division.name || "Ukjent navn";
    divisionSelector.appendChild(optionTeam);


    const minutesPerPeriod = rowelement.querySelector(".minutesperperiod");
    minutesPerPeriod.textContent = division.minutesperperiod || "Ukjent";
    minutesPerPeriod.addEventListener("click", () => triggerEditInput(minutesPerPeriod, division, "minutesperperiod", "number", tabelid));
    
    const numberOfPeriods = rowelement.querySelector(".numberofperiods");
    numberOfPeriods.textContent = division.numberofperiods || "Ukjent";
    numberOfPeriods.addEventListener("click", () => triggerEditInput(numberOfPeriods, division, "numberofperiods", "number", tabelid));
    
    return rowelement;

}

function listTeams(teams) {
    // Get selected values from division and group selectors
    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;

    // Filter teams based on selected division and group
    const filteredTeams = teams.filter(team => {
        const matchesDivision = !divisionValue || team.division === divisionValue;
        const matchesGroup = !groupValue || team.group === groupValue;
        return matchesDivision && matchesGroup;
    });

    // Sort teams alphabetically by name
    filteredTeams.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB); // Alphabetical order
    });

    // Get the list holder and clear previous content
    const list = document.getElementById("teamlistholder");
    list.replaceChildren(); // Clear previous content

    let tabelid = "tbl3ta1WZBr6wKPSp";
    let Cluboptions = convertArrayToOptions(gClub,"name","airtable");
    Cluboptions.unshift({text:"Ingen klubb",value:""});

    let Divisionoptions = convertArrayToOptions(gDivision,"name","airtable");
    // Update row counter
    list.parentElement.querySelector(".rowcounter").textContent = `${filteredTeams.length} stk.`;

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".teamrow");

    for (let team of filteredTeams) {

        const teamrow = makeTeamrow(nodeelement,team,Cluboptions,Divisionoptions,tabelid);
        list.appendChild(teamrow);
    }
}

function makeTeamrow(nodeelement,team,Cluboptions,Divisionoptions,tabelid){
    let rowelement = nodeelement.cloneNode(true);
        // Set team logo if available
        if (team.clublogo) {
            rowelement.querySelector(".teamlogo").src = team.clublogo;
        }

        // Set team details
        const teamName = rowelement.querySelector(".name")
        teamName.textContent = team.name || "Ukjent navn";
        teamName.addEventListener("click", () => triggerEditInput(teamName, team, "name", "text", tabelid));

        const teamInitial = rowelement.querySelector(".initialer")
        teamInitial.textContent = team.initials || "-";
        teamInitial.addEventListener("click", () => triggerEditInput(teamInitial, team, "initials", "text", tabelid));

        const teamClubName = rowelement.querySelector(".club");
        teamClubName.textContent = team.clubname || "Ukjent klubb";
        teamClubName.addEventListener("click", () => triggerEditDropdown(teamClubName, team, "club", Cluboptions, tabelid));


        const DivisionName = rowelement.querySelector(".division");
        DivisionName.textContent = team.divisionname || "Ukjent divisjon";
        DivisionName.addEventListener("click", () => triggerEditDropdown(DivisionName, team, "division", Divisionoptions, tabelid));

        const groupName = rowelement.querySelector(".groupname")
        groupName.textContent = team.groupname || "-";
        let Division = gDivision.find(item => item.airtable === team.division);
        if(Division){
            let Groupoptions = convertArrayToOptions(Division.group,"name","airtable");
            Groupoptions.push({text:"Ingen gruppe",value:""});
            groupName.addEventListener("click", () => triggerEditDropdown(groupName, team, "group",Groupoptions , tabelid));
        }

        // button panel
        const deletebutton = rowelement.querySelector(".deletebutton");
        deletebutton.onclick = function () {
            const confirmation = window.confirm("Ønsker du å slette dette laget?");
            if (confirmation) {
                DELETEairtable(baseId,tabelid,team.airtable,"teamdeletedresponse");
                rowelement.remove();
            } else {
            console.log("Sletting avbrutt.");
            }
        }


        
    return rowelement;
    
}

function filterMatchesBySelector(matchs) {
    const selector = document.getElementById("matchMainListSelector");

    if (selector.value === "") {
        // Vise alle kamper
        return matchs;
    } else if (selector.value === "upcoming") {
        // Vise alle kamper som ikke har resultat
        return matchs.filter(match => !match.goalteam1 && !match.goalteam2);
    } else if (selector.value === "ongoing") {
        // Vise alle kamper som har startet, men ikke har resultat
        return matchs.filter(match => {
            const now = new Date();
            // Lag ISO-format uten tidssonejustering for nåværende tid
            const nowString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
            
            // Bruk match.time som den er, siden den allerede er i ISO-format
            const matchTime = match.time;
        
            return matchTime <= nowString && (!match.goalteam1 && !match.goalteam2);
        });
        
        
        
    } else if (selector.value === "played") {
        // Vise alle kamper som det foreligger resultat på
        return matchs.filter(match => 
            match.goalteam1 !== undefined && 
            match.goalteam1 !== "" &&
            match.goalteam2 !== undefined && 
            match.goalteam2 !== ""
        );
    }
}

function listMatch(matchs) {
    // Get selected values from division and group selectors
    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;
    const typeValue = document.getElementById("typeSelector").value;
    const endplayValue = document.getElementById("endplaySelector").value;
    const locationValue = document.getElementById("locationSelector").value;

    // Filter matches based on selected division and group
    let filteredMatches = matchs.filter(match => {
        const matchesDivision = !divisionValue || match.division === divisionValue;
        const matchesGroup = !groupValue || match.group === groupValue;
        const matchesType = !typeValue || match.typematch === typeValue;
        const endplay = !endplayValue || match.endplay === endplayValue;
        const location = !locationValue || match.location === locationValue;
        return matchesDivision && matchesGroup && matchesType && endplay &&location;
    });

    // Sort matches by time
    filteredMatches.sort((a, b) => new Date(a.time) - new Date(b.time));


     //sjekke om status selector er aktiv
     const mselector = document.getElementById("matchMainListSelector");

     if(mselector){
         filteredMatches = filterMatchesBySelector(filteredMatches);
     }

    // Get the list holder and clear previous content
    const list = document.getElementById("matchlistholder");
    list.replaceChildren(); // Clear previous content

    let tabelid = "tblrHBFa60aIdqkUu";

    // Update row counter
    list.parentElement.querySelector(".rowcounter").textContent = `${filteredMatches.length} stk.`;

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".matchrow");
    alertMessage = [];
    for (let match of filteredMatches) {
        list.appendChild(makeMatchrow(nodeelement,match,tabelid));
    }

    // Sjekk om det finnes meldinger i alertMessage
    if (alertMessage.length > 0) {
        // Kombiner alle meldingene med linjeskift
        const alertText = alertMessage.join("\n");
        
        // Vis alert med linjeskift mellom hver melding
        alert(alertText);

        // Tøm arrayet
        alertMessage = [];
    }

}

function makeMatchrow(nodeelement,match,tabelid,startopen){
        let rowelement = nodeelement.cloneNode(true);
        rowelement.id = match.airtable+"matchrow";
        
        const Timeelement = rowelement.querySelector(".time")
        Timeelement.textContent = formatIsoDateName(match.time) || "Ukjent startdato";
        Timeelement.dataset.date = formatIsoDateValue(match.time);
        Timeelement.addEventListener("click", () => triggerEditInput(Timeelement, match, "time", "datetime-local", tabelid));
        //hvis det inneholder tekst istede for dato marker bord rundt Temelement
        if (match.timelable) {
            Timeelement.style.border = "2px solid blue";
        }

        const divisionName = rowelement.querySelector(".division")
        divisionName.textContent = match.divisionname || "Ukjent divisjon";
        if(!match.groupname && !match.team1 && !match.team2){
            //hvis ikke gruppe eller team er valgt skal en kunne velge divisjon
        let Divisionoptions = convertArrayToOptions(gDivision,"name","airtable");
        divisionName.addEventListener("click", () => triggerEditDropdown(divisionName, match, "division", Divisionoptions, tabelid));
        }
        
        const groupName = rowelement.querySelector(".groupname")
        groupName.textContent = match.groupname || "-";

        //Gruppevelger
        if(!match.endplay && !match.type && match.division){
            //skal kunne velges om det ikke er en slutspillkamp og divisjon er valgt
            let Division = gDivision.find(item => item.airtable === match.division);
            let Groupoptions = convertArrayToOptions(Division.group,"name","airtable");
            
            //sjekker teamene er på kampen og at det stemmer
            const team1 = gTeam.find(item => item.airtable === match.team1);
            const team2 = gTeam.find(item => item.airtable === match.team2);

            if(team1 && team2){
            //to lag lagt til kampen
            
                if (team1.group == team2.group) {
                    // Samme gruppe på begge lag
                    Groupoptions = [{ text: team1.groupname, value: team1.group }];

                    // Fjern border fra raden
                    rowelement.style.border = "none";
                } else {
                    // Lagene tilhører forskjellige grupper
                    let thisMessage = "Lagene på kamp nr: " + match.nr + " tilhører forskjellige grupper.";
                    alertMessage.push(thisMessage);

                    // Legg til rød border med 2px på raden
                    rowelement.style.border = "2px solid red";
                }

            }else if(team1){
                //bare team 1
                Groupoptions = [{text:team1.groupname,value:team1.group}];
            }else if(team2){
                //bare team 2
                Groupoptions = [{text:team2.groupname,value:team2.group}];
            }

            //legger til for å fjerne kamp fra gruppe
            Groupoptions.push({text:"Ingen gruppe",value:""});
            groupName.addEventListener("click", () => triggerEditDropdown(groupName, match, "group", Groupoptions, tabelid));  
        }

        //Finne aktuelle team å velge til kampen
        let TeamOptions = [];
        let teamsInDivisionAndGroup = [];
        if(match.team1 || match.team1){
            //det er et av teamene som er lagt inn i kampen
            let teamObject;
            if(match.typematch){
                //er det en finalekamp alle team i denne divisjon
                teamsInDivisionAndGroup = gTeam.filter(team => {
                    return team.division === match.division;
                });

            }else{

                if(match.team1){
                    //hente opplysninger om divisjon og evt grupper fra team 1
                    teamObject = gTeam.find(item => item.airtable === match.team1);
                }else{
                    //hente opplysninger om divisjon og evt grupper fra team 2
                    teamObject = gTeam.find(item => item.airtable === match.team2);
                }
                teamsInDivisionAndGroup = gTeam.filter(team => {
                    return team.division === teamObject.division && (!teamObject.group || team.group === teamObject.group);
                });
            }
        }else{
            // ingen team er lagt til kampen finn alle team som tilhører match.division og eventuelt match.group
            teamsInDivisionAndGroup = gTeam.filter(team => {
                return team.division === match.division && (!match.group || team.group === match.group);
            });
        }
        TeamOptions = convertArrayToOptions(teamsInDivisionAndGroup,"name","airtable");
        TeamOptions.unshift({text:"Ingen lag",value:""});


        //team 1 velger
        const teamName1 = rowelement.querySelector(".team1name");
        teamName1.textContent = match.team1name || match.placeholderteam1 || "Ingen lag";
        if(TeamOptions.length >1){
        teamName1.addEventListener("click", () => triggerEditDropdown(teamName1, match, "team1", TeamOptions, tabelid));
        }
        if (match.team1clublogo) {rowelement.querySelector(".team1logo").src = match.team1clublogo};
        
        // Team 2 velger
        const teamName2 = rowelement.querySelector(".team2name")
        teamName2.textContent = match.team2name || match.placeholderteam2 || "Ingen lag";
        if(TeamOptions.length >1){
        teamName2.addEventListener("click", () => triggerEditDropdown(teamName2, match, "team2", TeamOptions, tabelid));
        }
        if (match.team2clublogo) {rowelement.querySelector(".team2logo").src = match.team2clublogo};

        //Scorfelt1
        const goal1 = rowelement.querySelector(".goalteam1");
        goal1.textContent = (match.goalteam1 === "" || match.goalteam1 === null) ? "-" : match.goalteam1;

        //Scorfelt2
        const goal2 = rowelement.querySelector(".goalteam2");
        goal2.textContent = (match.goalteam2 === "" || match.goalteam2 === null) ? "-" : match.goalteam2;

        if(match.team1name && match.team2name){
        goal1.addEventListener("click", (disableGoalClick) => triggerEditInput(goal1, match, "goalteam1", "number", tabelid));
        goal2.addEventListener("click", (disableGoalClick) => triggerEditInput(goal2, match, "goalteam2", "number", tabelid));
        }

        //Result lable
        const ResultStatus = rowelement.querySelector(".resultstatus");
        let MatchTypeoptions = [
            { text: "Ingen", value: "" },
            { text: "8-delsfinale", value: "eighthfinale" },
            { text:"Plass-kamp",value:"placementfinale"},
            { text: "Runde 2 kamper", value: "round2" },
            { text: "Kvartfinale", value: "quarterfinale" },
            { text: "Semifinale", value: "semifinale" },
            { text: "Bronsefinale", value: "bronzefinale" },
            { text: "Finale", value: "finale" }
            ];

        
            if ((match.goalteam1 === "" || match.goalteam1 === null) || 
            (match.goalteam2 === "" || match.goalteam2 === null)) {
            ResultStatus.textContent = "Ikke spilt";
            } else {
                ResultStatus.textContent = "Resultat";
                ResultStatus.classList.add("played");
            }
        
        
        //finalekamp farge og tekst
        if(match.typematch){
            ResultStatus.textContent = MatchTypeoptions.find(option => option.value === match.typematch)?.text || "-";
            // Legg til border med farge og størrelse
            ResultStatus.style.borderColor = "#ffb700"; // Border-farge
            ResultStatus.style.borderWidth = "1px";     // Border-størrelse
            ResultStatus.style.borderStyle = "solid";   // Border-stil
        }else{
            ResultStatus.style.borderStyle = "none";   // Border-stil
        }
        //bane tekst
        const fieldName = rowelement.querySelector(".field");
        fieldName.textContent = match.fieldname || "-";
        fieldName.addEventListener("click", () => triggerEditInput(fieldName, match, "fieldname", "text", tabelid));

        //lokasjonstekst
        const loaction = rowelement.querySelector(".location");
        loaction.textContent = match.location || "-";
        loaction.addEventListener("click", () => triggerEditInput(loaction, match, "location", "text", tabelid));

        //Dommer tekst
        const refereeName = rowelement.querySelector(".refereename");
        refereeName.textContent = match.refereename || "-";
        refereeName.addEventListener("click", () => triggerEditInput(refereeName, match, "refereename", "text", tabelid));

        //Type kamp text
        const typeMatch = rowelement.querySelector(".type");
        typeMatch.textContent = MatchTypeoptions.find(option => option.value === match.typematch)?.text || "-";
       
        //Sluttspill text
        const endplay = rowelement.querySelector(".endplay");
        endplay.textContent = match.endplay || "-";

        //Finalenummer
        const endplayplace = rowelement.querySelector(".finalenr");
        endplayplace.textContent = match.endplayplace || "-";
        endplayplace.addEventListener("click", () => triggerEditInput(endplayplace, match, "endplayplace", "number", tabelid));

        //Kampnummer
        const matchnr = rowelement.querySelector(".matchnr");
        matchnr.textContent = match.nr || "-";

        //plaseholdertxet1
        const placeholdertext1 = rowelement.querySelector(".team1placeholder");
        placeholdertext1.parentElement.style.display = "none";
        
        //plaseholdertxet1
        const placeholdertext2 = rowelement.querySelector(".team2placeholder");
        placeholdertext2.parentElement.style.display = "none";

        //sjekke om det er kun dato som skal vises
        const onlyday = rowelement.querySelector(".onlyday");
        if(match.onlyday){
            //skjule tid
            onlyday.checked = true;
        }else{
            onlyday.checked = false;    
        }
        // Legg til eventlistener for å håndtere klikk
        onlyday.addEventListener("change", () => {
            triggerEditCheckbox(onlyday,match,"onlyday",tabelid);
        });

        //timelable hvis istede for tidspunkt
        const timelable = rowelement.querySelector(".timelable");
        timelable.textContent = match.timelable || "-";
        timelable.addEventListener("click", () => triggerEditInput(timelable, match, "timelable", "text", tabelid));
        
        if(match.typematch){
            //det er en finalekamp hvis plasholders
            placeholdertext1.textContent =  match.placeholderteam1 || "-";
            placeholdertext2.textContent =  match.placeholderteam2 || "-";

            placeholdertext1.parentElement.style.display = "block";
            placeholdertext2.parentElement.style.display = "block";

            

            placeholdertext1.addEventListener("click", () => triggerEditInput(placeholdertext1, match, "placeholderteam1", "text", tabelid));
            placeholdertext2.addEventListener("click", () => triggerEditInput(placeholdertext2, match, "placeholderteam2", "text", tabelid));
        }

        //om det er valgt gruppe i kampen
        if(match.group && !match.endplay){
            // kampen har en gruppe og sluttspilldelen skal skjules
            endplayplace.parentElement.style.display = "none";
            typeMatch.parentElement.style.display = "none";
            endplay.parentElement.style.display = "none";
        }else{
            //sluttspil A eller B
            const endplayOptions = [{text:"A",value:"A"},{text:"B",value:"B"},{text:"Ingen",value:""}];
            endplay.addEventListener("click", () => triggerEditDropdown(endplay, match, "endplay", endplayOptions, tabelid));
            
            //finalenr
            if(match.endplay){
                endplayplace.addEventListener("click", () => triggerEditInput(endplayplace, match, "endplayplace", "number", tabelid));
            }
            //gruppetekst skal skjules
            groupName.parentElement.style.display = "none";

            //type kamp åttendedels,kvart,semi,finale 
            typeMatch.addEventListener("click", () => triggerEditDropdown(typeMatch, match, "typematch", MatchTypeoptions, tabelid));
        }

        const openButton = rowelement.querySelector(".infobutton");
        const allInfoMatch = rowelement.querySelector(".allinfomatch");
        const contentinfomatch = allInfoMatch.querySelector(".contentinfomatch");
        //starter skjult
        if(startopen){
        allInfoMatch.style.display = "block";
        }else{
        allInfoMatch.style.display = "none"; 
        }

    // Sjekk hvilken sport det er
        const volleyballDivbox = allInfoMatch.querySelector(".volleyballresults");
        const icehockeyDivbox = allInfoMatch.querySelector(".icehockey");
        volleyballDivbox.style.display = "none";
        icehockeyDivbox.style.display = "none";

        if (activetournament.sport[0] === "recSCesi2BGmCyivZ") {
            // Det er volleyball
            volleyballDivbox.style.display = "flex";

            const settAa = volleyballDivbox.querySelector(".settaa");
            settAa.textContent = match.settaa || "-";
            settAa.addEventListener("click", () => triggerEditInput(settAa, match, "settaa", "number", tabelid));

            const settAb = volleyballDivbox.querySelector(".settab");
            settAb.textContent = match.settab || "-";
            settAb.addEventListener("click", () => triggerEditInput(settAb, match, "settab", "number", tabelid));

            const settBa = volleyballDivbox.querySelector(".settba");
            settBa.textContent = match.settba || "-";
            settBa.addEventListener("click", () => triggerEditInput(settBa, match, "settba", "number", tabelid));

            const settBb = volleyballDivbox.querySelector(".settbb");
            settBb.textContent = match.settbb || "-";
            settBb.addEventListener("click", () => triggerEditInput(settBb, match, "settbb", "number", tabelid));


            const settCa = volleyballDivbox.querySelector(".settca");
            settCa.textContent = match.settca || "-";
            settCa.addEventListener("click", () => triggerEditInput(settCa, match, "settca", "number", tabelid));

            const settCb = volleyballDivbox.querySelector(".settcb");
            settCb.textContent = match.settcb || "-";
            settCb.addEventListener("click", () => triggerEditInput(settCb, match, "settcb", "number", tabelid));

            // Sjekk om det finnes noen settverdier
            const hasSetValues = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb]
            .some(value => value != null && value.toString().trim() !== "");


            if (hasSetValues) {
                // Regne ut stillingen basert på settverdiene
                const sets = [
                    { teamA: match.settaa, teamB: match.settab },
                    { teamA: match.settba, teamB: match.settbb },
                    { teamA: match.settca, teamB: match.settcb },
                ];

                let teamAWins = 0;
                let teamBWins = 0;

                sets.forEach(set => {
                    const teamA = parseInt(set.teamA) || 0;
                    const teamB = parseInt(set.teamB) || 0;

                    if (teamA > teamB) {
                        teamAWins++;
                    } else if (teamB > teamA) {
                        teamBWins++;
                    }
                });

                goal1.textContent = teamAWins;
                goal2.textContent = teamBWins;

                //sett kampen som spilt
                if (ResultStatus.textContent == "Ikke spilt") {
                    ResultStatus.textContent = "Resultat";
                    ResultStatus.classList.add("played");
                }



            } 
        }else if(activetournament.sport[0] === "reca0jxxTQAtlUTNu" || activetournament.sport[0] === "recfdSgV9u9fQldac" ){
            // det er icehockey eller innendørsbandy
            icehockeyDivbox.style.display = "block";

            //utvisningsminutter
            const penaltyminteam1 = icehockeyDivbox.querySelector(".penaltyminteam1");
            penaltyminteam1.textContent = (match.penaltyminteam1 === "" || match.penaltyminteam1 === null) ? "-" : match.penaltyminteam1;
            const penaltyminteam2 = icehockeyDivbox.querySelector(".penaltyminteam2");
            penaltyminteam2.textContent = (match.penaltyminteam2 === "" || match.penaltyminteam2 === null) ? "-" : match.penaltyminteam2;


            if(match.team1name && match.team2name){
                penaltyminteam1.addEventListener("click", (disablePenaltyClick) => triggerEditInput(penaltyminteam1, match, "penaltyminteam1", "number", tabelid));
                penaltyminteam2.addEventListener("click", (disablePenaltyClick) => triggerEditInput(penaltyminteam2, match, "penaltyminteam2", "number", tabelid));
            }
            

            const switsjOvertime = icehockeyDivbox.querySelector(".overtime");
            switsjOvertime.checked = !!match.overtime; // Konverter til boolean for sikkerhet
            
            // Legg til eventlistener for å håndtere klikk
            switsjOvertime.addEventListener("change", () => {
                triggerEditCheckbox(switsjOvertime,match,"overtime",tabelid);
            });

            const switsjshootout = icehockeyDivbox.querySelector(".shootout");
            switsjshootout.checked = !!match.overtime;
            
            switsjshootout.addEventListener("change", () => {
                triggerEditCheckbox(switsjshootout,match,"shootout",tabelid);
            });
        }
        //

        openButton.addEventListener("click", () => {
            if (allInfoMatch) {
              if (allInfoMatch.style.display === "block") {
                // 🔻 Skjul med fade ut først
                allInfoMatch.style.transition = "opacity 0.3s ease-in-out";
                allInfoMatch.style.opacity = "0";
          
                // Etter fade, reduser høyden
                setTimeout(() => {
                  allInfoMatch.style.transition = "height 0.3s ease-in-out";
                  const currentHeight = allInfoMatch.offsetHeight + "px";
                  allInfoMatch.style.height = currentHeight; // eksplisitt høyde før kollaps
                  requestAnimationFrame(() => {
                    allInfoMatch.style.height = "0";
                  });
          
                  // Etter høydeanimasjon, skjul elementet
                  setTimeout(() => {
                    allInfoMatch.style.display = "none";
                  }, 400); // match høydeovergang
          
                }, 300); // match fade-varighet
          
                openButton.classList.remove("open");
                openButton.classList.add("close");
          
              } else {
                // 🔼 Vis med animasjon: høyde, så fade inn
                allInfoMatch.style.display = "block";
                const targetHeight = allInfoMatch.scrollHeight + "px";
                allInfoMatch.style.height = "0";
                allInfoMatch.style.opacity = "0";
                allInfoMatch.style.transition = "height 0.3s ease-in-out";
          
                requestAnimationFrame(() => {
                  allInfoMatch.style.height = targetHeight;
                });
          
                // Etter høydeanimasjon, fade inn
                setTimeout(() => {
                  allInfoMatch.style.transition = "opacity 0.3s ease-in-out";
                  allInfoMatch.style.opacity = "1";
          
                  // 🎯 Sett høyde til auto etterpå for dynamisk innhold
                  setTimeout(() => {
                    allInfoMatch.style.height = "auto";
                  }, 300); // vent til høydeanimasjonen er ferdig
          
                }, 300); // match høydeovergang
          
                openButton.classList.remove("close");
                openButton.classList.add("open");
              }
            }
          });
          
        
    
       // Finn synlige child-elementer (ikke display: none)
        const visibleChildren = Array.from(contentinfomatch.children).filter(
        (child) => window.getComputedStyle(child).display !== "none"
        );
        const columnCount = Math.ceil(Math.sqrt(visibleChildren.length));
        contentinfomatch.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
  

        // button panel
        const deletebutton = rowelement.querySelector(".deletebutton");
        deletebutton.onclick = function () {
            const confirmation = window.confirm("Ønsker du å slette denne kampen?");
            if (confirmation) {
                DELETEairtable(baseId,tabelid,match.airtable,"matchdeletedresponse");
                rowelement.remove();
            } else {
            console.log("Sletting avbrutt.");
            }
        }

        const duplicatebutton = rowelement.querySelector(".duplicate");
        duplicatebutton.onclick = function () {
            const confirmation = window.confirm("Ønsker du å kopiere denne kampen?");
            if (confirmation) {
            copyMatch(duplicatebutton,match,tabelid); 
            } else {
            console.log("Kopiering avbrutt.");
            }
        };

        const matchlogconteiner = rowelement.querySelector(".matchlogconteiner");
        matchlogconteiner.style.display = "none"; // Start med skjult
        //men om der er data i loggen skal den være åpen
        if(match.matchlogg && match.matchlogg.length > 0){
            matchlogconteiner.style.display = "block";
        }
        const matchlogicon = rowelement.querySelector(".matchlogicon");
        matchlogicon.onclick = function () {
           //åpne lukke matchlogconteiner
            if (matchlogconteiner.style.display === "block") {
                matchlogconteiner.style.display = "none";
            } else {
                matchlogconteiner.style.display = "block";
            }
        };
        //last inn kamplogg
        loadMatchLog(rowelement,match);



    return rowelement




}

function copyMatch(button, match, tabelid) {
    // Finn den nåværende raden (rowelement) ved å gå oppover i DOM
    const rowelement = button.parentElement.parentElement.parentElement;

    // Simuler klikk på infoknapp
    rowelement.querySelector(".infobutton").click();

    // Finn elementet som skal klones
    const elementlibrary = document.getElementById("elementlibrary");
    if (!elementlibrary) {
        console.error("Elementlibrary ikke funnet.");
        return;
    }

    const nodeelement = elementlibrary.querySelector(".copywait");
    if (!nodeelement) {
        console.error("Klonbart element ikke funnet i elementlibrary.");
        return;
    }

    // Klon og legg det inn i DOM
    const newRow = nodeelement.cloneNode(true);
    rowelement.parentElement.insertBefore(newRow, rowelement.nextSibling);
    copyMatchElementholder = newRow;

    // Kopier info fra match-objektet
    const newMatch = {
        division: [match.division],
        endplay: match.endplay,
        endplayplace: Number(match.endplayplace+1) || null,
        field: [match.field],
        fieldname: match.fieldname,
        group: [match.group],
        location: match.location,
        placeholderteam1: match.placeholderteam1,
        placeholderteam2: match.placeholderteam2,
        refereename: match.refereename,
        team1: [match.team1],
        team2: [match.team2],
        time: match.time || new Date().toISOString(), // Fallback hvis tid ikke er definert
        tournament: [match.tournament],
        typematch: match.typematch
    };

    // Fjern nøkler med tomme verdier, inkludert tomme arrays
    const cleanedMatch = removeEmtyValuForSave(newMatch);

    // Opprett en ny kamp på server
    POSTairtable(baseId, tabelid, JSON.stringify(cleanedMatch), "newMatchresponse");
}

function newMatchresponse(data) {
    // Sjekk for nødvendige elementer
    const elementlibrary = document.getElementById("elementlibrary");
    if (!elementlibrary) {
        console.error("Elementlibrary ikke funnet ved respons.");
        return;
    }

    const nodeelement = elementlibrary.querySelector(".matchrow");
    if (!nodeelement) {
        console.error("Klonbart matchrow-element ikke funnet.");
        return;
    }
    if(data.fields?.division){
        data.fields.division = data.fields.division[0];
    }else{
        data.fields.division = "";
    }

     //konverterer divisjonsname
    if(data.fields?.divisionname){
        data.fields.divisionname = data.fields.divisionname[0];
    }else{
        data.fields.divisionname = "";
    }
    
    //konverterer group
    if(data.fields?.group){
        data.fields.group = data.fields.group[0];
    }else{
        data.fields.group = "";
    }

    //konverterer tournament
    if(data.fields?.tournament){
        data.fields.tournament = data.fields.tournament[0];
    }else{
        data.fields.tournament = "";
    }







    gMatchs.push(data.fields);

    // Opprett ny rad basert på responsdata
    const newRow = makeMatchrow(nodeelement, data.fields, "tblrHBFa60aIdqkUu");

    // Erstatt midlertidig placeholder med den nye raden
    copyMatchElementholder.parentElement.insertBefore(newRow, copyMatchElementholder.nextSibling);
    copyMatchElementholder.remove();

    // Klikk på infoknappen i den nye raden
    newRow.querySelector(".infobutton").click();
}

function matchdeletedresponse(data){
   console.log(data);
   //fjerne lokalt 
   gMatchs = gMatchs.filter(item => item.airtable !== data.fields.airtable);
}

function teamdeletedresponse(data) {
    console.log(data);

    // Finn og fjern objektet lokalt
    gTeam = gTeam.filter(item => item.airtable !== data.fields.airtable);
}

function createNewMatch(){

  // Finn elementet som skal klones
  const elementlibrary = document.getElementById("elementlibrary");
  const nodeelement = elementlibrary.querySelector(".copywait");
  const list = document.getElementById("matchlistholder");

  const newRow = nodeelement.cloneNode(true);
  newRow.querySelector(".copytext").textContent = "Oppretter kamp";
  list.prepend(newRow);
  copyMatchElementholder = newRow;

    //finne divisjonsid, gruppeide, kamptype, sluttspill, klient,tounering,
    let divisionId = document.getElementById("divisionSelector").value;
    let groupId = document.getElementById("groupSelector").value;
    let typematch = document.getElementById("typeSelector").value;
    let endplay = document.getElementById("endplaySelector").value;

     // Legg til dagens dato og klokkeslett
     const now = new Date();
     const time = now.toISOString().slice(0, 16); 


    let saveobject = {
        tournament:[activetournament.airtable],
        time:time,
        typematch:typematch,
        division:[divisionId],
        group:[groupId],
        endplay:endplay
    }
    const cleanedMatch = removeEmtyValuForSave(saveobject);

    // Opprett en ny kamp på server
    POSTairtable(baseId, "tblrHBFa60aIdqkUu", JSON.stringify(cleanedMatch), "newMatchresponse");
}

function removeEmtyValuForSave(array) {
    return Object.fromEntries(
        Object.entries(array).filter(([_, value]) => {
            return (
                value !== null &&              // Ikke null
                value !== undefined &&         // Ikke undefined
                value !== "" &&                // Ikke tom streng
                !(Array.isArray(value) && (    // Ikke tom array eller array med kun tomme eller ugyldige verdier
                    value.length === 0 || 
                    value.every(v => v === undefined || v === null || v === "")
                ))
            );
        })
    );
}

function createNewTeam(){

  // Finn elementet som skal klones
  const elementlibrary = document.getElementById("elementlibrary");
  const nodeelement = elementlibrary.querySelector(".copywait");
  const list = document.getElementById("teamlistholder");

  const newRow = nodeelement.cloneNode(true);
  newRow.querySelector(".copytext").textContent = "Oppretter lag";
  list.prepend(newRow);
  copyTeamElementholder = newRow;

    //finne divisjonsid, gruppeide,tounering,
    let divisionId = document.getElementById("divisionSelector").value;
    let groupId = document.getElementById("groupSelector").value;


    let saveobject = {
        tournament:[activetournament.airtable],
        name:"Nytt lag",
        division:[divisionId],
        group:[groupId]
    }
    const cleanedMatch = removeEmtyValuForSave(saveobject);

    // Opprett en ny lag på server
    POSTairtable(baseId, "tbl3ta1WZBr6wKPSp", JSON.stringify(cleanedMatch), "newTeamresponse");

}

function newTeamresponse(data){

// Sjekk for nødvendige elementer
const elementlibrary = document.getElementById("elementlibrary");
const nodeelement = elementlibrary.querySelector(".teamrow");

if(data.fields?.division){
    data.fields.division = data.fields.division[0];
}else{
    data.fields.division = "";
}

//konverterer group
if(data.fields?.group){
    data.fields.group = data.fields.group[0];
}else{
    data.fields.group = "";
}

 //konverterer tournament
 if(data.fields?.tournament){
    data.fields.tournament = data.fields.tournament[0];
}else{
    data.fields.tournament = "";
}


gTeam.push(data.fields);

let Cluboptions = convertArrayToOptions(gClub,"name","airtable");
Cluboptions.unshift({text:"Ingen klubb",value:""});

let Divisionoptions = convertArrayToOptions(gDivision,"name","airtable");



// Opprett ny rad basert på responsdata
const newRow = makeTeamrow(nodeelement, data.fields,Cluboptions,Divisionoptions, "tbl3ta1WZBr6wKPSp");

// Erstatt midlertidig placeholder med den nye raden
copyTeamElementholder.parentElement.insertBefore(newRow, copyTeamElementholder.nextSibling);
copyTeamElementholder.remove();

}

function createNewGroup(divisjon,rowelement) {

    // Finn høyeste tall i gruppene i denne divisjonen
    let higestGroupnr = 0;
    let baseName = "G"; // Standard base-navn for grupper

    for (let group of divisjon.group) {
        // Finn navnet uten tall (base-navnet)
        const nameWithoutNumber = group.name.replace(/\d+/g, ""); // Fjerner tall fra navnet

        // Hvis dette er første gruppe, sett baseName
        if (!baseName) {
            baseName = nameWithoutNumber;
        }

        // Finn tall i group.name (sett 0 hvis ingen tall finnes)
        const numberMatch = group.name.match(/\d+/); // Henter første tall fra navnet
        const thisNumber = numberMatch ? parseInt(numberMatch[0]) : 0;

        // Oppdater høyeste gruppenummer
        if (higestGroupnr < thisNumber) {
            higestGroupnr = thisNumber;
        }
    }

    // Generer nytt gruppenavn
    const newGroupName = `${baseName}${higestGroupnr + 1}`;

    // Opprett nytt objekt for lagring
    const saveObject = {
        name: newGroupName,
        division: [divisjon.airtable]
    };

    copyDivisionElement = rowelement;
    console.log("Lagrer ny gruppe:", saveObject);

    // Opprett gruppen på server (eller annen ønsket handling)
    POSTairtable(baseId, "tblq6O7fjqtz5ZOae", JSON.stringify(saveObject), "newGroupResponse");
}

function newGroupResponse(data) {
    console.log(data);
    // Sjekk for nødvendige elementer
const elementlibrary = document.getElementById("elementlibrary");
const nodeelement = elementlibrary.querySelector(".divisionrow");

    // Oppdater divisjon
    const newGroup = data.fields;

    // Finn riktig divisjon i gDivision basert på newGroup.division[0]
    const divisionId = newGroup.division[0];
    const division = gDivision.find(div => div.airtable === divisionId);

    if (!division) {
        console.error("Divisjon ikke funnet:", divisionId);
        return;
    }

    // Oppdater divisjonsobjektet
    if (!division.group) {
        division.group = []; // Sørg for at group finnes
    }

    division.group.push(newGroup); // Legg til den nye gruppen i divisjonen

    const newRow = makeDivisionRow(nodeelement,division);

    // Oppdater elementet inne i kopien med klassen "name" med det nye navnet
    const nameElement = newRow.querySelector(".name");
    if (nameElement) {
        nameElement.textContent = newGroup.name;
    }

    // Erstatt midlertidig placeholder med den nye raden
    copyDivisionElement.parentElement.insertBefore(newRow, copyDivisionElement.nextSibling);
    copyDivisionElement.remove();

    console.log("Ny gruppe lagt til og placeholder fjernet.");
}
