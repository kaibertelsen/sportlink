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

    let filteredTeams;
    if (activeDivision === "") {
        filteredTeams = data; // Vis alle lag hvis "Alle" er valgt
    } else {
        filteredTeams = data.filter(team => team.division[0] === activeDivision);
    }

    const list = document.getElementById("teamslistholder");
    list.replaceChildren();

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.tablegroupholder');
    const copyelement = nodeelement.cloneNode(true);
    list.appendChild(copyelement);

    const nameelement = copyelement.querySelector(".groupheadername");
    nameelement.textContent = "Tabell";

    const contentholder = copyelement.querySelector(".rowholder");
    const nodeteamhholder = contentholder.querySelector('.resultrow');

    let range = 1;
    for (let team of filteredTeams) {
        const rowelement = nodeteamhholder.cloneNode(true);
        const rangenr = rowelement.querySelector(".rangenr");
        rangenr.textContent = range;

        const logoteam = rowelement.querySelector(".clublogo");
        logoteam.src = team.clublogo[0];

        const teamname = rowelement.querySelector(".teamnamelable");
        teamname.textContent = team.name;

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

    nodeteamhholder.remove();
}


