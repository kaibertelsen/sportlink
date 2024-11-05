function getTeams(){
    var body = airtablebodylistAND({tournamentid:activetournament.airtable,archived:0});
    Getlistairtable(baseId,"tbl3ta1WZBr6wKPSp",body,"getTeamresponse");
}

function getTeamresponse(data){
    teams = rawdatacleaner(data);
    listteams(teams);
}



function listteams(data){

    let teamslist = generatePointToTeams(data);
    const list = document.getElementById("teamslistholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.tablegroupholder');
    const copyelement = nodeelement.cloneNode(true);
    list.appendChild(copyelement);
    
        const nameelement = copyelement.querySelector(".groupheadername");
        nameelement.textContent = "Test divensjon"

        const contentholder = copyelement.querySelector(".rowholder");
        const nodeteamhholder = elementlibrary.querySelector('.resultrow');

        
        for (let team of teamslist){
            const rowelement = nodeteamhholder.cloneNode(true);
         
            const rangenr = rowelement.querySelector(".rangenr");
            rangenr.textContent = i;

            const logoteam = rowelement.querySelector(".clublogo");
            logoteam.removeAttribute('srcset');
            logoteam.src = team.clublogo[0];

            const teamname = rowelement.querySelector(".teamnamelable");
            teamname.textContent = team.name;

            //point
            const played = rowelement.querySelector(".played");
            played.textContent = team.points.played;

            const won = rowelement.querySelector(".won");
            won.textContent = team.points.won

            const drawn = rowelement.querySelector(".drawn");
            drawn.textContent = team.points.drawn

            const lost = rowelement.querySelector(".lost");
            lost.textContent = team.points.lost

            const goalsfa = rowelement.querySelector(".goalsfa");
            goalsfa.textContent = team.points.goalsFor+"-"+team.points.goalsAgainst;

            const goaldifference = rowelement.querySelector(".goaldifference");
            goaldifference.textContent = team.points.goalDifference

            const points = rowelement.querySelector(".points");
            points.textContent = team.points.points

            contentholder.appendChild(rowelement);
        }

        list.appendChild(nodeelement);
    
    
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

