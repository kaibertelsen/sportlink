function openTournament(Tournamentid){
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");
}

function responsGetTournament(data) {
    console.log(data.fields);

    // Hent tournament-data
    const tournament = data.fields;

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


function convertJSONrow(data) {
    try {
        return data.map(item => {
            // Fjern ekstra escape-tegn fra JSON-strengen
            const sanitizedItem = item.replace(/\\\"/g, '"').replace(/\\\\/g, '\\');
            
            // Parse JSON-strengen
            return JSON.parse(sanitizedItem);
        });
    } catch (error) {
        console.error("Feil ved parsing av JSON-rad:", error, item);
        return [];
    }
}


function updateTournamentInfo(tournament) {

const tournamentinfoheader = document.getElementById("tournamentinfoheader");
    tournamentinfoheader.querySelector(".tournamentname").textContent = tournament.name || "Ukjent turnering";
    tournamentinfoheader.querySelector(".tournamenticon").src = tournament.icon || "";
    tournamentinfoheader.querySelector(".sporticon").src = tournament.sporticon[0] || "";
    tournamentinfoheader.querySelector(".sportname").textContent = tournament.sportname[0] || "Ukjent sport";
    tournamentinfoheader.querySelector(".startdate").textContent = new Date(tournament.startdate).toLocaleDateString() || "Ukjent startdato";
    tournamentinfoheader.querySelector(".enddate").textContent = new Date(tournament.enddate).toLocaleDateString() || "Ukjent sluttdato";
    tournamentinfoheader.querySelector(".eventname").textContent = tournament.organizername[0] || "Ukjent Arrangement";
    
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





