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
        list.appendChild(rowelement);

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
            logoteam1.src = match.team1clublogo[0];

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
            logoteam2.src = match.team2clublogo[0];

            // Hvis det er volleyball og kampen er spilt, legg til settresultater
            const vollyresults = matchelement.querySelector(".vollyresults");
            if (isVolleyball && typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined" && match.goalsett) {
                vollyresults.style.display = "block"; // Gjør sett-resultatene synlige

                // Legg til sett-informasjon
                let goalsetData;
                try {
                    goalsetData = typeof match.goalsett === 'string' ? JSON.parse(match.goalsett) : match.goalsett;
                } catch (e) {
                    console.error("Feil ved parsing av goalsett:", e);
                    continue; // Hopp over hvis parsing feiler
                }

                vollyresults.innerHTML = ""; // Tøm tidligere resultater

                Object.entries(goalsetData).forEach(([setKey, setScores]) => {
                    const settNumber = setKey.replace("sett", ""); // Henter nummeret uten "sett"
                
                    const settText = document.createElement("div");
                    settText.classList.add("setttextlable");
                
                    // Lag et bold-element for settnummeret
                    const boldSetNumber = document.createElement("span");
                    boldSetNumber.style.fontWeight = "bold";
                    boldSetNumber.style.backgroundColor = "transparent"; // Fjern bakgrunnsfargen
                    boldSetNumber.textContent = `${settNumber}. `;
                
                    // Legg til resten av teksten etter settnummeret
                    const resultText = document.createTextNode(`${setScores.team1}-${setScores.team2}`);
                
                    // Kombiner bold settnummer og resultat
                    settText.appendChild(boldSetNumber);
                    settText.appendChild(resultText);
                
                    vollyresults.appendChild(settText);
                });
                
            } else {
                if(vollyresults){vollyresults.style.display = "none"};
                
            }

            contentholder.appendChild(matchelement);
        }

        // Fjern nodematchholder-malen etter bruk
        nodematchholder.remove();
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

