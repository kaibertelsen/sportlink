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
    // Get active division filter
    const activeDivision = getActiveDivisionFilter();
    // Filter matches by active division or include all if none is set
    const filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    const matchs = sortDateArray(filteredMatches, "time");
    const grouparray = grouptype === "dato" ? groupArraybyDate(matchs) : [];

    // Clear previous list and get template elements
    const list = document.getElementById("matchlistholder");
    list.replaceChildren();
    const elementLibrary = document.getElementById("elementlibrary");
    const nodeElement = elementLibrary.querySelector('.groupholder');

    let firstUnplayedMatch = null; // Variable to store the first unplayed match element

    // Populate matches into groups
    for (let item of grouparray) {
        const rowElement = nodeElement.cloneNode(true);
        rowElement.querySelector(".groupheadername").textContent = formatDateToNorwegian(item.date);
        const matchList = rowElement.querySelector(".matchlist");
        const matchHolder = rowElement.querySelector('.matchholder');

        // Iterate over each match in the group
        for (let match of item.matches) {
            const matchElement = matchHolder.cloneNode(true);

            // Populate team names and logos
            matchElement.querySelector(".team1").textContent = match.team1name;
            matchElement.querySelector(".logoteam1").src = match.team1clublogo;
            matchElement.querySelector(".team2").textContent = match.team2name;
            matchElement.querySelector(".logoteam2").src = match.team2clublogo;

            // Show division label if no specific division filter is set
            const divisionLabel = matchElement.querySelector(".divisionlable");
            if (activeDivision === "") {
                divisionLabel.textContent = match.divisionname;
                divisionLabel.style.color = mapColors("second");
            } else {
                divisionLabel.style.display = "none";
            }

            // Handle set scores and determine winner
            const settList = matchElement.querySelector(".settlist");
            const setKeys = ["sett1", "sett2", "sett3"];
            const hasRequiredSetScores = match.sett1 && match.sett2;

            if (hasRequiredSetScores) {
                settList.style.display = "grid";
                const settDivNode = settList.querySelector(".settdiv");
                let columnCount = 0;
                let team1SetsWon = 0;
                let team2SetsWon = 0;

                // Populate set scores and determine winner
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

            // Set result or match time
            const resultLabel = matchElement.querySelector(".resultlable");
            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                resultLabel.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                resultLabel.style.fontWeight = "bold";
                resultLabel.style.color = mapColors("main");
                resultLabel.style.fontSize = "16px";
            } else {
                resultLabel.textContent = formatdatetoTime(match.time);
                resultLabel.style.fontWeight = "normal";

                // Set first unplayed match if it hasn't been set already
                if (!firstUnplayedMatch) {
                    firstUnplayedMatch = matchElement;
                }
            }

            // Remove border-bottom for the last match in the group
            if (item.matches.indexOf(match) === item.matches.length - 1) {
                matchElement.style.borderBottom = 'none';
            }

            matchList.appendChild(matchElement);
        }

        // Clean up template element and append the row to the list
        matchHolder.remove();
        list.appendChild(rowElement);
    }

    // Scroll to the first unplayed match if specified
    if (scroll && firstUnplayedMatch) {
        let scrollContainer = firstUnplayedMatch.parentElement;
        while (scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
            scrollContainer = scrollContainer.parentElement;
        }

        if (scrollContainer) {
            // Scroll within the identified scrollable container
            setTimeout(() => {
                const targetPosition = firstUnplayedMatch.offsetTop - scrollContainer.offsetTop;
                scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });

                setTimeout(() => {
                    scrollPositions[currentIndex] = scrollContainer.scrollTop;
                }, 500);
            }, 500);
        } else {
            // Fallback to scrolling the entire page
            setTimeout(() => {
                firstUnplayedMatch.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                    scrollPositions[currentIndex] = window.scrollY;
                }, 500);
            }, 500);
        }
    }
}


