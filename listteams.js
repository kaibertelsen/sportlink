function getTeams(){
    var body = airtablebodylistAND({tournamentid:activetournament.airtable,archived:0});
    Getlistairtable(baseId,"tbl3ta1WZBr6wKPSp",body,"getTeamresponse");
}

function getTeamresponse(data){
    teams = rawdatacleaner(data);
    listteams(teams);
}



function listteams(data) {
    // Generer og sorter teamslist basert på poeng, målforskjell og mål scoret
    let teamslist = generatePointToTeams(data);
    
    const list = document.getElementById("teamslistholder");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering
    
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.tablegroupholder');
    const copyelement = nodeelement.cloneNode(true);
    list.appendChild(copyelement);

    // Sett divisjonsnavn
    const nameelement = copyelement.querySelector(".groupheadername");
    nameelement.textContent = "Test divisjon"; // Oppdater dette med riktig divisjonsnavn om nødvendig

    const contentholder = copyelement.querySelector(".rowholder");
    const nodeteamhholder = contentholder.querySelector('.resultrow');

    let range = 1;
    for (let team of teamslist) {
        const rowelement = nodeteamhholder.cloneNode(true);
        contentholder.appendChild(rowelement);

        // Rangering
        const rangenr = rowelement.querySelector(".rangenr");
        rangenr.textContent = range;

        // Laglogo
        const logoteam = rowelement.querySelector(".clublogo");
        logoteam.removeAttribute('srcset');
        logoteam.src = team.clublogo[0];

        // Lagnavn
        const teamname = rowelement.querySelector(".teamnamelable");
        teamname.textContent = team.name;

        // Poengstatistikk
        rowelement.querySelector(".played").textContent = team.points.played;
        rowelement.querySelector(".won").textContent = team.points.won;
        rowelement.querySelector(".drawn").textContent = team.points.drawn;
        rowelement.querySelector(".lost").textContent = team.points.lost;
        rowelement.querySelector(".goalsfa").textContent = `${team.points.goalsFor}-${team.points.goalsAgainst}`;
        rowelement.querySelector(".goaldifference").textContent = team.points.goalDifference;
        rowelement.querySelector(".points").textContent = team.points.points;

        range++;
    }

    // Fjern mal-elementet etter loop for å unngå ekstra, tom rad
    nodeteamhholder.remove();
}







function groupArraybyDate(matchs){

        // Initialiser en ny array for grupperte kamper
        let grouparray = [];
        // Bruk reduce for å gruppere kampene etter dato
        let groupedByDate = matchs.reduce((groups, match) => {
            // Hent kun datoen fra 'time'-feltet (uten klokkeslett)
            let matchDate = new Date(match.time).toISOString().split('T')[0];

            // Hvis datoen ikke finnes i grupperingsobjektet, opprett en ny array for den datoen
            if (!groups[matchDate]) {
                groups[matchDate] = [];
            }

            // Legg til kampen i arrayen for den aktuelle datoen
            groups[matchDate].push(match);

            return groups;
        }, {});

        // Konverter objektet til en array med dato som nøkkel
        grouparray = Object.keys(groupedByDate).map(date => {
            return {
                date: date,
                matches: groupedByDate[date]
            };
        });
    

    return grouparray;
}

