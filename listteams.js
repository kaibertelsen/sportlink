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

    // Generer og sorter teamslist basert på poeng, målforskjell og mål scoret
    let teamslist = generatePointToTeams(filteredTeams);

    // Gruppér lagene etter divisjon og gruppe
    const teamsByDivisionAndGroup = teamslist.reduce((acc, team) => {
        const division = team.divisionname[0] || "Ukjent divisjon"; // Standardnavn hvis divisjon mangler
        const group = team.group ? team.group[0] : null; // Null hvis gruppe mangler

        if (!acc[division]) {
            acc[division] = {};
        }
        if (!acc[division][group || "Uten gruppe"]) {
            acc[division][group || "Uten gruppe"] = [];
        }
        acc[division][group || "Uten gruppe"].push(team);
        return acc;
    }, {});

    const list = document.getElementById("teamslistholder");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementlibrary = document.getElementById("elementlibrary");

    // Bestem hvilket element som skal kopieres basert på sportstypen
    const isVolleyball = activetournament.sport[0] === "recSCesi2BGmCyivZ"; // Volleyball ID
    const nodeelement = isVolleyball
        ? elementlibrary.querySelector('.volleyballview')
        : elementlibrary.querySelector('.fotballview');

    // Loop gjennom hver divisjon og gruppe, og opprett en `tablegroupholder` for hver
    for (const [divisionName, groups] of Object.entries(teamsByDivisionAndGroup)) {
        for (const [groupName, groupTeams] of Object.entries(groups)) {
            const copyelement = nodeelement.cloneNode(true);
            
            // Sett divisjons- og gruppenavn, kun divisjonsnavn om gruppe mangler
            const nameelement = copyelement.querySelector(".groupheadername");
            nameelement.textContent = groupName === "Uten gruppe" ? divisionName : `${divisionName} - ${groupName}`;

            const contentholder = copyelement.querySelector(".rowholder");
            const nodeteamhholder = contentholder.querySelector('.resultrow');

            // Sorter lagene i gruppen basert på poeng, målforskjell og mål scoret
            groupTeams.sort((a, b) => {
                if (b.points.points !== a.points.points) {
                    return b.points.points - a.points.points;
                }
                if (b.points.goalDifference !== a.points.goalDifference) {
                    return b.points.goalDifference - a.points.goalDifference;
                }
                return b.points.goalsFor - a.points.goalsFor;
            });

            let range = 1;
            for (let team of groupTeams) {
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
                rowelement.querySelector(".lost").textContent = team.points.lost;
                
                if (isVolleyball) {
                    // Sett-statistikk for volleyball
                    rowelement.querySelector(".setsdifference").textContent = `${team.points.setsFor}-${team.points.setsAgainst}`;
                    rowelement.querySelector(".points").textContent = team.points.points;
                } else {
                    // Målstatistikk for fotball
                    rowelement.querySelector(".drawn").textContent = team.points.drawn;
                    rowelement.querySelector(".goalsfa").textContent = `${team.points.goalsFor}-${team.points.goalsAgainst}`;
                    rowelement.querySelector(".goaldifference").textContent = team.points.goalDifference;
                    rowelement.querySelector(".points").textContent = team.points.points;
                }

                range++;
            }

            // Fjern mal-elementet etter å ha lagt til alle rader
            nodeteamhholder.remove();
            list.appendChild(copyelement);
        }
    }
}
