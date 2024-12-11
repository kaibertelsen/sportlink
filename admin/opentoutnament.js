
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

    console.log("Turneringer lastet inn i dropdown:", tournaments);
}


// Funksjon som kjøres når en turnering velges
function onTournamentSelected(airtableId, tournamentName) {
    console.log("Valgt turnering:", tournamentName, "med Airtable ID:", airtableId);
    openTournament(airtableId);


//hvis loader
document.getElementById("loadingholdertournament").style.display = "block";

}

function openTournament(Tournamentid){
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");
}

function responsGetTournament(data) {
    console.log(data.fields);
//skul loader
    document.getElementById("loadingholdertournament").style.display = "none";
    document.getElementById("tournamentinfopage").style.display = "block";

    // Hent tournament-data
    const tournament = data.fields;
    activetournament = tournament;
    // Klikk på tournament-knapp
    document.getElementById("tournamenttabbutton").click();

    // Oppdater turneringsinformasjon
    updateTournamentInfo(tournament);

    // Konverter divisjoner og liste dem opp
    const divisions = convertJSONrow(tournament.divisjonjson);
    listDivision(divisions);

    const team = convertJSONrow(tournament.teamjson);
    listTeams(teams);
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

function listDivision(divisions) {
    const list = document.getElementById("divisionlistholder");
    list.replaceChildren(); // Fjern tidligere innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisionrow");

    for (let division of divisions) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".name").textContent = division.name || "Ukjent navn";

        // Legg til grupper
        const groupNode = rowelement.querySelector(".group");
        division.group.forEach(group => {
            const groupElement = groupNode.cloneNode(true);
            groupElement.querySelector(".groupname").textContent = group.name;
            groupNode.parentElement.appendChild(groupElement);
        });
        groupNode.style.display = "none";

        // Legg til sluttspill
        const endNode = rowelement.querySelector(".endplay");
        division.endplay.forEach(endplay => {
            const endElement = endNode.cloneNode(true);
            endElement.querySelector(".endname").textContent = endplay.endplayname;
            endElement.querySelector(".endcount").textContent = endplay.finalecount;
            endNode.parentElement.appendChild(endElement);
        });
        endNode.style.display = "none";

        list.appendChild(rowelement);
    }
}

function listTeams(teams) {
    //tab navigasjon
    document.getElementById("teamtabbutton").click();

    const list = document.getElementById("teamlistholder");
    list.replaceChildren(); // Fjern tidligere innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".teamrow");

    for (let team of teams) {
        const rowelement = nodeelement.cloneNode(true);

        if(team.clublogo){
        tournamentinfoheader.querySelector(".teamlogo").src = team.clublogo;
        }

        rowelement.querySelector(".name").textContent = team.name || "Ukjent navn";
        rowelement.querySelector(".initialer").textContent = team.initials || "Ingen initialer";
        rowelement.querySelector(".club").textContent = team.clubname || "Ukjent klubb";
        rowelement.querySelector(".division").textContent = team.divisionname || "Ukjent divisjon";
        rowelement.querySelector(".groupname").textContent = team.groupname || "Ukjent gruppe";
        list.appendChild(rowelement);
    }
}





