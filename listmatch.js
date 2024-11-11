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

    for (let item of grouparray) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".groupheadername").textContent = formatDateToNorwegian(item.date);
        const matchlist = rowelement.querySelector(".matchlist");
        const matchholder = rowelement.querySelector('.matchholder');

        for (let match of item.matches) {
            const matchelement = matchholder.cloneNode(true);
            matchlist.appendChild(matchelement);

            matchelement.querySelector(".team1").textContent = match.team1name;
            matchelement.querySelector(".logoteam1").src = match.team1clublogo;
            matchelement.querySelector(".team2").textContent = match.team2name;
            matchelement.querySelector(".logoteam2").src = match.team2clublogo;

            const divisionlable = matchelement.querySelector(".divisionlable");
            if (activeDivision == "") {
                divisionlable.textContent = match.divisionname;
                divisionlable.style.color = mapColors("second");
            } else {
                divisionlable.style.display = "none";
            }

            const settlist = matchelement.querySelector(".settlist");
            const setKeys = ["sett1", "sett2", "sett3"];
            const hasRequiredSetScores = match.sett1 && match.sett2;

            if (hasRequiredSetScores) {
                settlist.style.display = "grid";
                const settdivnode = settlist.querySelector(".settdiv");
                let columnCount = 0;
                let team1SetsWon = 0;
                let team2SetsWon = 0;

                for (let i = 0; i < setKeys.length; i++) {
                    if (match[setKeys[i]]) {
                        const settdiv = settdivnode.cloneNode(true);
                        const setttextlable = settdiv.querySelector(".setttextlable");
                        setttextlable.textContent = match[setKeys[i]];

                        const [team1Score, team2Score] = match[setKeys[i]].split('-').map(Number);
                        if (team1Score > team2Score) team1SetsWon++;
                        else if (team2Score > team1Score) team2SetsWon++;

                        settlist.appendChild(settdiv);
                        columnCount++;
                    }
                }

                settdivnode.remove();
                settlist.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

                match.goalteam1 = team1SetsWon;
                match.goalteam2 = team2SetsWon;
                settlist.style.display = "none";
            } else {
                settlist.style.display = "none";
            }

            const resultlable = matchelement.querySelector(".resultlable");
            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                resultlable.style.fontWeight = "bold";
                resultlable.style.color = mapColors("main");
                resultlable.style.fontSize = "16px";
            } else {
                resultlable.textContent = formatdatetoTime(match.time);
                resultlable.style.fontWeight = "normal";

                if (!firstUnplayedMatch) {
                    firstUnplayedMatch = matchelement;
                }
            }

            if (item.matches.indexOf(match) === item.matches.length - 1) {
                matchelement.style.borderBottom = 'none';
            }

            matchlist.appendChild(matchelement);
        }

        matchholder.remove();
        list.appendChild(rowelement);
    }

    
}





