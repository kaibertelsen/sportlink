function getTeams(){
    var body = airtablebodylistAND({tournamentid:activetournament.airtable,archived:0});
    Getlistairtable(baseId,"tbl3ta1WZBr6wKPSp",body,"getTeamresponse");
}

function getTeamresponse(data){
    teams = rawdatacleaner(data);
    listteams(teams);
}



function listteams(data){
console.log(data);
generatePointToTeams(data);
//sorter på poeng,målforskjell osv.

/*
let matchs = sortDateArray(data,"time");

let grouparray = [];
    if(grouptype == "dato"){
        grouparray = groupArraybyDate(matchs)
    }

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');

    for (let item of grouparray) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.onclick = function() {
            //loadTourment(item);
        }
     
        const nameelement = rowelement.querySelector(".groupheadername");
        nameelement.textContent = formatDateToNorwegian(item.date);

        const contentholder = rowelement.querySelector(".contentholder");
        contentholder.replaceChildren();
        const nodematchholder = elementlibrary.querySelector('.matchholder');

        let rownr = 0;
        for (let match of item.matches){
            const matchelement = nodematchholder.cloneNode(true);
            if(rownr>0){
                matchelement.classList.remove("n1");
            }
            const team1name = matchelement.querySelector(".team1");
            team1name.textContent = match.team1name;

            const logoteam1 = matchelement.querySelector(".logoteam1");
            logoteam1.removeAttribute('srcset');
            logoteam1.src = match.team1clublogo[0];

            const timelable = matchelement.querySelector(".timelable");
            timelable.textContent = formatdatetoTime(match.time);
            //stilling om kampen er spilt

            const team2name = matchelement.querySelector(".team2");
            team2name.textContent = match.team2name;

            const logoteam2 = matchelement.querySelector(".logoteam2");
            logoteam2.removeAttribute('srcset');
            logoteam2.src = match.team2clublogo[0];

            contentholder.appendChild(matchelement);

            rownr ++
        }

        list.appendChild(rowelement);
    }
    */
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

