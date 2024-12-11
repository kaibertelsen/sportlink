function openTournament(Tournamentid){
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");
}

function responsGetTournament(data) {
    console.log(data.fields);

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
    tournamentinfoheader.querySelector(".username").textContent = tournament.username[0] || "";

    const switsj = tournamentinfoheader.querySelector(".merkibj");
    switsj.checked = !tournament?.hidden;

}

function publishTournament() {
    // Vis en bekreftelsesdialog
    const userConfirmation = confirm("Er du sikker på at du vil publisere denne turneringen?");
    
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





