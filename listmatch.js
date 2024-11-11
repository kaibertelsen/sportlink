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
    const filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    const matchs = sortDateArray(filteredMatches, "time");
    const grouparray = grouptype === "dato" ? groupArraybyDate(matchs) : [];

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();
    const elementLibrary = document.getElementById("elementlibrary");
    const nodeElement = elementLibrary.querySelector('.groupholder');

    let firstUnplayedMatch = null;

    for (let item of grouparray) {
        const rowElement = nodeElement.cloneNode(true);
        rowElement.querySelector(".groupheadername").textContent = formatDateToNorwegian(item.date);
        const matchList = rowElement.querySelector(".matchlist");
        const matchHolder = rowElement.querySelector('.matchholder');

        for (let match of item.matches) {
            const matchElement = matchHolder.cloneNode(true);

            matchElement.querySelector(".team1").textContent = match.team1name;
            matchElement.querySelector(".logoteam1").src = match.team1clublogo;
            matchElement.querySelector(".team2").textContent = match.team2name;
            matchElement.querySelector(".logoteam2").src = match.team2clublogo;

            const divisionLabel = matchElement.querySelector(".divisionlable");
            if (activeDivision === "") {
                divisionLabel.textContent = match.divisionname;
                divisionLabel.style.color = mapColors("second");
            } else {
                divisionLabel.style.display = "none";
            }

            const settList = matchElement.querySelector(".settlist");
            const setKeys = ["sett1", "sett2", "sett3"];
            const hasRequiredSetScores = match.sett1 && match.sett2;

            if (hasRequiredSetScores) {
                settList.style.display = "grid";
                const settDivNode = settList.querySelector(".settdiv");
                let columnCount = 0;
                let team1SetsWon = 0;
                let team2SetsWon = 0;

                for (const key of setKeys) {
                    if (match[key]) {
                        const settDiv = settDivNode.cloneNode(true);
                        settDiv.querySelector(".setttextlable").textContent = match[key];
                        const [team1Score, team2Score] = match[key].split('-').map(Number);

                        if (team1Score > team2Score) team1SetsWon++;
                        else if (team2Score > team1Score) team2SetsWon++;

                        settList.appendChild(settDiv);
                        columnCount++;
                    }
                }

                settDivNode.remove();
                settList.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

                match.goalteam1 = team1SetsWon;
                match.goalteam2 = team2SetsWon;
                settList.style.display = "none";
            } else {
                settList.style.display = "none";
            }

            const resultLabel = matchElement.querySelector(".resultlable");
            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                resultLabel.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                resultLabel.style.fontWeight = "bold";
                resultLabel.style.color = mapColors("main");
                resultLabel.style.fontSize = "16px";
            } else {
                resultLabel.textContent = formatdatetoTime(match.time);
                resultLabel.style.fontWeight = "normal";

                if (!firstUnplayedMatch) {
                    firstUnplayedMatch = matchElement;
                }
            }

            if (item.matches.indexOf(match) === item.matches.length - 1) {
                matchElement.style.borderBottom = 'none';
            }

            matchList.appendChild(matchElement);
        }

        matchHolder.remove();
        list.appendChild(rowElement);
    }

    if (scroll && firstUnplayedMatch) {
        // Find the nearest scrollable container specific to this slide
        let scrollContainer = firstUnplayedMatch.closest('.swipe-slide');

        if (scrollContainer) {
            setTimeout(() => {
                // Get the exact position within this isolated container
                const targetPosition = firstUnplayedMatch.offsetTop - scrollContainer.offsetTop;
                scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });

                // Save the scroll position for future use
                setTimeout(() => {
                    scrollPositions[currentIndex] = scrollContainer.scrollTop;
                }, 500);
            }, 500);
        }
    }
}



