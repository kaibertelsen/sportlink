function getTeams(){
    var body = airtablebodylistAND({tournamentid:activetournament.airtable,archived:0});
    Getlistairtable(baseId,"tbl3ta1WZBr6wKPSp",body,"getTeamresponse");
}

function getTeamresponse(data){
    teams = rawdatacleaner(data);
    listteams(teams);
}



function listteams(data) {
    const activeDivision = getActiveDivisionFilter();

    // Filtrer lagene basert på aktivt divisjonsfilter
    let filteredTeams = activeDivision === "" ? data : data.filter(team => team.division[0] === activeDivision);

    // Generer poengstatistikk og sorter lagene
    filteredTeams = generatePointToTeams(filteredTeams);
    filteredTeams.sort((a, b) => {
        if (b.points.points !== a.points.points) {
            return b.points.points - a.points.points; // Sorter etter poeng
        }
        if (b.points.goalDifference !== a.points.goalDifference) {
            return b.points.goalDifference - a.points.goalDifference; // Sorter etter målforskjell
        }
        return b.points.goalsFor - a.points.goalsFor; // Sorter etter mål for
    });

    // Hent elementer og klargjør for oppdatering
    const list = document.getElementById("teamslistholder");
    if (!list) return; // Sjekk at elementet finnes
    list.replaceChildren();

    const elementlibrary = document.getElementById("elementlibrary");
    if (!elementlibrary) return; // Sjekk at elementet finnes
    const nodeelement = elementlibrary.querySelector('.tablegroupholder');
    const copyelement = nodeelement.cloneNode(true);
    list.appendChild(copyelement);

    // Oppdater tittel for tabellen
    const nameelement = copyelement.querySelector(".groupheadername");
    nameelement.textContent = "Tabell";

    const contentholder = copyelement.querySelector(".rowholder");
    const nodeteamhholder = contentholder.querySelector('.resultrow');

    // Legg til hvert lag i listen
    let range = 1;
    for (let team of filteredTeams) {
        const rowelement = nodeteamhholder.cloneNode(true);

        rowelement.querySelector(".rangenr").textContent = range;
        rowelement.querySelector(".clublogo").src = team.clublogo[0];
        rowelement.querySelector(".teamnamelable").textContent = team.name;

        // Fyll inn poengstatistikken for laget
        rowelement.querySelector(".played").textContent = team.points.played;
        rowelement.querySelector(".won").textContent = team.points.won;
        rowelement.querySelector(".drawn").textContent = team.points.drawn;
        rowelement.querySelector(".lost").textContent = team.points.lost;
        rowelement.querySelector(".goalsfa").textContent = `${team.points.goalsFor}-${team.points.goalsAgainst}`;
        rowelement.querySelector(".goaldifference").textContent = team.points.goalDifference;
        rowelement.querySelector(".points").textContent = team.points.points;

        contentholder.appendChild(rowelement);
        range++;
    }

    // Fjern mal-elementet etter å ha lagt til alle rader
    nodeteamhholder.remove();
}



