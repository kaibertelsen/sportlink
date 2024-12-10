function openTournament(Tournamentid){
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");
}

function responsGetTournament(data) {
    console.log(data.fields);

    // Hent tournament-data
    const tournament = data.fields;

    // Klikk på tournament-knapp
    document.getElementById("tournamenttabbutton").click();

    // Konverter divisjoner og liste dem opp
    const divisions = convertJSONrow(tournament.divisjonjson);
    listDivision(divisions);

    // TODO: Legg til funksjonalitet for å håndtere teamjson og matchjson
    // const teams = convertJSONrow(tournament.teamjson);
    // const matches = convertJSONrow(tournament.matchjson);

    // Oppdater turneringsinformasjon
    updateTournamentInfo(tournament);
}


function convertJSONrow(data) {
    try {
        return data.map(item => JSON.parse(item));
    } catch (error) {
        console.error("Feil ved parsing av JSON-rad:", error);
        return [];
    }
}

function updateTournamentInfo(tournament) {
    document.getElementById("tournamentName").textContent = tournament.name || "Ukjent turnering";
    document.getElementById("tournamentIcon").src = tournament.sporticon[0] || "";
    document.getElementById("tournamentSport").textContent = tournament.sportname[0] || "Ukjent sport";
    document.getElementById("tournamentStartDate").textContent = new Date(tournament.startdate).toLocaleDateString() || "Ukjent startdato";
    document.getElementById("tournamentEndDate").textContent = new Date(tournament.enddate).toLocaleDateString() || "Ukjent sluttdato";
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
        const endNode = rowelement.querySelector(".endplaydiv");
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





