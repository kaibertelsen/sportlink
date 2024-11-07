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
    list.replaceChildren(); // Tøm eksisterende innhold i hovedliste

    const elementlibrary = document.getElementById("elementlibrary");
    const isVolleyball = activetournament.sport[0] === "recSCesi2BGmCyivZ"; // Volleyball ID
    const nodeelement = isVolleyball
        ? elementlibrary.querySelector('.volleyball')
        : elementlibrary.querySelector('.fotball');

    for (let item of grouparray) {
        const rowelement = nodeelement.cloneNode(true);
        
        const nameelement = rowelement.querySelector(".groupheadername");
        nameelement.textContent = formatDateToNorwegian(item.date);

        const contentholder = rowelement.querySelector(".contentholder");
        const nodematchholder = rowelement.querySelector('.matchholder');

        for (let match of item.matches) {
            const matchelement = nodematchholder.cloneNode(true);
            contentholder.appendChild(matchelement);

            const team1name = matchelement.querySelector(".team1");
            team1name.textContent = match.team1name;
            
            const logoteam1 = matchelement.querySelector(".logoteam1");
            logoteam1.src = match.team1clublogo;

            const timelable = matchelement.querySelector(".timelable");

            // Sett resultat eller tid basert på om kampen er spilt
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
            logoteam2.src = match.team2clublogo;

            // Hvis det er volleyball, sjekk om settresultater finnes
            const vollyresults = matchelement.querySelector(".vollyresults");
            if (isVolleyball) {
                const setKeys = ["sett1", "sett2", "sett3"];
                let hasSetScores = setKeys.some(setKey => match[setKey]);

                if (hasSetScores) {
                    // Sørg for at display er satt til grid hvis settresultater finnes
                    vollyresults.style.display = "grid";

                    const settdivnode = vollyresults.querySelector(".settdiv");
                    let columnCount = 0;

                    // Legg til sett-resultater hvis de finnes
                    for (let i = 0; i < setKeys.length; i++) {
                        if (match[setKeys[i]]) {
                            const settdiv = settdivnode.cloneNode(true);

                            const settnr = settdiv.querySelector(".settnr");
                            settnr.textContent = i + 1;

                            const setttextlable = settdiv.querySelector(".setttextlable");
                            setttextlable.textContent = match[setKeys[i]];

                            vollyresults.appendChild(settdiv);
                            columnCount++;
                        }
                    }

                    settdivnode.remove(); // Fjern malen etter bruk
                    vollyresults.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`; // Dynamisk antall kolonner
                } else if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                    // Hvis settdata mangler, vis total score for kampen
                    vollyresults.style.display = "block"; // Standardvisning for enkel score
                    vollyresults.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                    vollyresults.style.fontWeight = "bold";
                } else {
                    if (vollyresults) vollyresults.style.display = "none";
                }
            } else {
                // For andre sporter enn volleyball, bare vis total score om kampen er spilt
                if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                    vollyresults.style.display = "block";
                    vollyresults.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                    vollyresults.style.fontWeight = "bold";
                } else {
                    vollyresults.style.display = "none";
                }
            }

            contentholder.appendChild(matchelement);
        }

        // Fjern nodematchholder-malen etter bruk
        nodematchholder.remove();

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

