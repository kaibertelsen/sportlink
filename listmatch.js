function getMatch(data){
    var body = airtablebodylistAND({tournamentid:data.airtable,archived:0});
    Getlistairtable(baseId,"tblrHBFa60aIdqkUu",body,"getMatchresponse");
}

function getMatchresponse(data,id){
    matches = rawdatacleaner(data);
    listmatch(matches,"dato");
}


function listmatch(data, grouptype) {
    // Hent aktivt divisjonsfilter
    const activeDivision = getActiveDivisionFilter();

    // Filtrer kampene basert på aktivt divisjonsfilter
    let filteredMatches;
    if (activeDivision === "") {
        filteredMatches = data; // Vis alle kamper hvis "Alle" er valgt
    } else {
        filteredMatches = data.filter(match => match.division[0] === activeDivision);
    }

    // Sorter og grupper kampene basert på valgt type
    let matchs = sortDateArray(filteredMatches, "time");
    let grouparray = [];
    if (grouptype === "dato") {
        grouparray = groupArraybyDate(matchs);
    }

    const list = document.getElementById("matchlistholder");
    list.replaceChildren(); // Tøm eksisterende innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');

    for (let item of grouparray) {
        const rowelement = nodeelement.cloneNode(true);
        const nameelement = rowelement.querySelector(".groupheadername");
        nameelement.textContent = formatDateToNorwegian(item.date);

        const contentholder = rowelement.querySelector(".contentholder");
        contentholder.replaceChildren();
        const nodematchholder = elementlibrary.querySelector('.matchholder');

        for (let match of item.matches) {
            const matchelement = nodematchholder.cloneNode(true);
            const team1name = matchelement.querySelector(".team1");
            team1name.textContent = match.team1name;
            const logoteam1 = matchelement.querySelector(".logoteam1");
            logoteam1.src = match.team1clublogo[0];
            const timelable = matchelement.querySelector(".timelable");

            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                timelable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                timelable.style.fontWeight = "bold";
            } else {
                timelable.textContent = formatdatetoTime(match.time);
                timelable.style.fontWeight = "normal";
            }

            const team2name = matchelement.querySelector(".team2");
            team2name.textContent = match.team2name;
            const logoteam2 = matchelement.querySelector(".logoteam2");
            logoteam2.src = match.team2clublogo[0];

            contentholder.appendChild(matchelement);
        }

        list.appendChild(rowelement);
    }
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

