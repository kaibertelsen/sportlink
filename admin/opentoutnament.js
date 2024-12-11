
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

// Funksjon som kjøres når en turnering velges
function onTournamentSelected(airtableId, tournamentName) {
    console.log("Valgt turnering:", tournamentName, "med Airtable ID:", airtableId);
    openTournament(airtableId);
    

}

function openTournament(Tournamentid){
    // Klikk på tournament-knapp
    document.getElementById("tournamenttabbutton").click();
    //hvis loader
     document.getElementById("loadingholdertournament").style.display = "block";
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");

    //tøm listene
    document.getElementById("divisionlistholder").replaceChildren();
    document.getElementById("teamlistholder").replaceChildren();
    document.getElementById("matchlistholder").replaceChildren();

    //skjul gruppeselectorer
    document.getElementById("groupSelectorTeam").style.display = "none";
    document.getElementById("divisionSelectorMatch").style.display = "none";

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
    listDivision(divisions);

    const teams = convertJSONrow(tournament.teamjson);
    listTeams(teams);

    const matchs = convertJSONrow(tournament.matchjson);
    listMatch(matchs);
    // TODO: Legg til funksjonalitet for å håndtere teamjson og matchjson
    // const teams = convertJSONrow(tournament.teamjson);
    // const matches = convertJSONrow(tournament.matchjson);

   
    


}

function updateTournamentInfo(tournament) {

const tournamentinfoheader = document.getElementById("tournamentinfoheader");
    tournamentinfoheader.querySelector(".tournamentname").textContent = tournament.name || "Ukjent turnering";
    tournamentinfoheader.querySelector(".tournamenticon").src = tournament.icon || "";
    tournamentinfoheader.querySelector(".sportname").textContent = tournament.sportname[0] || "Ukjent sport";
    tournamentinfoheader.querySelector(".startdate").textContent = new Date(tournament.startdate).toLocaleDateString() || "Ukjent startdato";
    tournamentinfoheader.querySelector(".enddate").textContent = new Date(tournament.enddate).toLocaleDateString() || "Ukjent sluttdato";
    tournamentinfoheader.querySelector(".eventname").textContent = tournament.organizername[0] || "Ukjent Arrangement";
    tournamentinfoheader.querySelector(".username").textContent = tournament.username || "";

    const switsj = tournamentinfoheader.querySelector(".merkibj");
    switsj.checked = !tournament?.hidden;

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

function divisionSelectorChange(selectorId) {
    // Find the selected division ID
    
    // Populate the groupSelector dropdown
    const groupSelector = document.getElementById(selectorId);
    let divId = groupSelector.value;

    if(divId == ""){
  
    }else{
        // Find groups associated with the division
        let groups = findGroupByDivision(divId);

        
        groupSelector.style.display = "block"
        groupSelector.replaceChildren(); // Clear previous options

        // Add default option "Alle grupper"
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Alle grupper";
        groupSelector.appendChild(defaultOption);

        // Add group options
        groups.forEach(group => {
            const option = document.createElement("option");
            option.value = group.airtable;
            option.textContent = group.name || "Ukjent navn";
            groupSelector.appendChild(option);
        });

    }
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

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisionrow");

    // Clear and prepare selectors
    const divisionSelectorTeam = document.getElementById("divisionSelectorTeam");
    const divisionSelectorMatch = document.getElementById("divisionSelectorMatch");
    divisionSelectorTeam.replaceChildren();
    divisionSelectorMatch.replaceChildren();

    // Add default option "Alle divisjoner"
    const defaultOptionTeam = document.createElement("option");
    defaultOptionTeam.value = "";
    defaultOptionTeam.textContent = "Alle divisjoner";
    divisionSelectorTeam.appendChild(defaultOptionTeam);

    const defaultOptionMatch = document.createElement("option");
    defaultOptionMatch.value = "";
    defaultOptionMatch.textContent = "Alle divisjoner";
    divisionSelectorMatch.appendChild(defaultOptionMatch);

    for (let division of divisions) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".name").textContent = division.name || "Ukjent navn";

        // Add groups
        const groupNode = rowelement.querySelector(".group");
        division.group.forEach(group => {
            const groupElement = groupNode.cloneNode(true);
            groupElement.querySelector(".groupname").textContent = group.name;
            groupNode.parentElement.appendChild(groupElement);
        });
        groupNode.style.display = "none";

        // Add endplay
        const endNode = rowelement.querySelector(".endplay");
        division.endplay.forEach(endplay => {
            const endElement = endNode.cloneNode(true);
            endElement.querySelector(".endname").textContent = endplay.endplayname;
            endElement.querySelector(".endcount").textContent = endplay.finalecount;
            endNode.parentElement.appendChild(endElement);
        });
        endNode.style.display = "none";

        // Add row to list
        list.appendChild(rowelement);

        // Populate selectors with options
        const optionTeam = document.createElement("option");
        optionTeam.value = division.airtable;
        optionTeam.textContent = division.name || "Ukjent navn";
        divisionSelectorTeam.appendChild(optionTeam);

        const optionMatch = document.createElement("option");
        optionMatch.value = division.airtable;
        optionMatch.textContent = division.name || "Ukjent navn";
        divisionSelectorMatch.appendChild(optionMatch);
    }
}

function listTeams(teams) {
 
    const list = document.getElementById("teamlistholder");
    list.replaceChildren(); // Fjern tidligere innhold

    list.parentElement.querySelector(".rowcounter").textContent = teams.length+" stk.";

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".teamrow");

    for (let team of teams) {
        const rowelement = nodeelement.cloneNode(true);

        if(team.clublogo){
            rowelement.querySelector(".teamlogo").src = team.clublogo;
        }

        rowelement.querySelector(".name").textContent = team.name || "Ukjent navn";
        rowelement.querySelector(".initialer").textContent = team.initials || "-";
        rowelement.querySelector(".club").textContent = team.clubname || "Ukjent klubb";
        rowelement.querySelector(".division").textContent = team.divisionname || "Ukjent divisjon";
        rowelement.querySelector(".groupname").textContent = team.groupname || "-";
        list.appendChild(rowelement);
    }




}

function listMatch(matchs) {
    const list = document.getElementById("matchlistholder");
    list.replaceChildren(); // Clear previous content

    list.parentElement.querySelector(".rowcounter").textContent = `${matchs.length} stk.`;

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".matchrow");

    for (let match of matchs) {
        const rowelement = nodeelement.cloneNode(true);

        rowelement.querySelector(".time").textContent = new Date(match.time).toLocaleDateString() || "Ukjent startdato";
        rowelement.querySelector(".division").textContent = match.divisionname || "Ukjent divisjon";
        rowelement.querySelector(".groupname").textContent = match.groupname || "-";
        rowelement.querySelector(".team1name").textContent = match.team1name || match.placeholderteam1 || "-";

        if (match.team1clublogo) {
            rowelement.querySelector(".team1logo").src = match.team1clublogo;
        }
        rowelement.querySelector(".goalteam1").textContent = match.goalteam1 || "-";
        rowelement.querySelector(".goalteam2").textContent = match.goalteam2 || "-";

        if (match.team2clublogo) {
            rowelement.querySelector(".team2logo").src = match.team2clublogo;
        }

        rowelement.querySelector(".team2name").textContent = match.team2name || match.placeholderteam2 || "-";
        rowelement.querySelector(".field").textContent = match.fieldname || "-";
        rowelement.querySelector(".location").textContent = match.location || "-";
        rowelement.querySelector(".refereename").textContent = match.refereename || "-";
        rowelement.querySelector(".finalenr").textContent = match.endplayplace || "-";
        rowelement.querySelector(".endplay").textContent = match.endplay || "-";
        rowelement.querySelector(".type").textContent = match.typematch || "-";
        rowelement.querySelector(".matchnr").textContent = match.nr || "-";

        // Add click event listener to toggle `.allinfomatch` styles
        rowelement.addEventListener("click", () => {
            const allInfoMatch = rowelement.querySelector(".allinfomatch");
            if (allInfoMatch) {
                // Toggle between `grid` and `none`
                allInfoMatch.style.display = allInfoMatch.style.display === "grid" ? "none" : "grid";
            }
        });

        list.appendChild(rowelement);
    }
}






