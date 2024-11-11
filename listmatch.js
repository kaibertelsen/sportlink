function getMatch(data){
    var body = airtablebodylistAND({tournamentid:data.airtable,archived:0});
    Getlistairtable(baseId,"tblrHBFa60aIdqkUu",body,"getMatchresponse");
}

function getMatchresponse(data,id){
    matches = rawdatacleaner(data);
    listmatch(matches,"dato");
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


// listmatch function adjusted to avoid scroll conflicts
function listmatch(data, grouptype, scroll) {
    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    let matchs = sortDateArray(filteredMatches, "time");
    let grouparray = grouptype === "dato" ? groupArraybyDate(matchs) : [];

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');
    let firstUnplayedMatch = null;

    grouparray.forEach(item => {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".groupheadername").textContent = formatDateToNorwegian(item.date);

        const matchlist = rowelement.querySelector(".matchlist");
        const matchholder = rowelement.querySelector('.matchholder');

        item.matches.forEach(match => {
            const matchelement = matchholder.cloneNode(true);
            matchlist.appendChild(matchelement);

            matchelement.querySelector(".team1").textContent = match.team1name;
            matchelement.querySelector(".logoteam1").src = match.team1clublogo;
            matchelement.querySelector(".team2").textContent = match.team2name;
            matchelement.querySelector(".logoteam2").src = match.team2clublogo;

            const resultlable = matchelement.querySelector(".resultlable");
            if (match.goalteam1 !== undefined && match.goalteam2 !== undefined) {
                resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                resultlable.style.fontWeight = "bold";
                resultlable.style.color = mapColors("main");
                resultlable.style.fontSize = "16px";
            } else {
                resultlable.textContent = formatdatetoTime(match.time);
                if (!firstUnplayedMatch) firstUnplayedMatch = matchelement;
            }

            matchlist.appendChild(matchelement);
        });

        list.appendChild(rowelement);
    });

    if (scroll && firstUnplayedMatch) {
        const scrollContainer = slides[1];
        const targetPosition = firstUnplayedMatch.offsetTop - scrollContainer.offsetTop;
        
        setTimeout(() => {
            scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });
            scrollPositions[1] = targetPosition;
        }, 500);
    }
}

