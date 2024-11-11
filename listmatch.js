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


function listmatch(data, grouptype, scroll) {
    // Hent aktivt divisjonsfilter
    const activeDivision = getActiveDivisionFilter();

    // Filtrer kampene basert på aktivt divisjonsfilter
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);

    // Sorter og grupper kampene basert på valgt type
    let matchs = sortDateArray(filteredMatches, "time");
    let grouparray = grouptype === "dato" ? groupArraybyDate(matchs) : [];

    const list = document.getElementById("matchlistholder");
    list.replaceChildren(); // Tøm eksisterende innhold i hovedliste

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');

    let firstUnplayedMatch = null; // Lagre referanse til første kamp som ikke er spilt
    
    for (let item of grouparray) {
        const rowelement = nodeelement.cloneNode(true);
        
        const nameelement = rowelement.querySelector(".groupheadername");
        nameelement.textContent = formatDateToNorwegian(item.date);

        const matchlist = rowelement.querySelector(".matchlist");
        const matchholder = rowelement.querySelector('.matchholder');

        for (let match of item.matches) {
            const matchelement = matchholder.cloneNode(true);
            matchlist.appendChild(matchelement);

            const team1name = matchelement.querySelector(".team1");
            team1name.textContent = match.team1name;
            
            const logoteam1 = matchelement.querySelector(".logoteam1");
            logoteam1.src = match.team1clublogo;

            const team2name = matchelement.querySelector(".team2");
            team2name.textContent = match.team2name;

            const logoteam2 = matchelement.querySelector(".logoteam2");
            logoteam2.src = match.team2clublogo;
            
            const divisionlable = matchelement.querySelector(".divisionlable");
            if(activeDivision == ""){
                divisionlable.textContent = match.divisionname;
                divisionlable.style.color = mapColors("second");

            }else{
                divisionlable.style.display = "none";
            }
            
            
            const settlist = matchelement.querySelector(".settlist");
            const setKeys = ["sett1", "sett2", "sett3"];
            const hasRequiredSetScores = match.sett1 && match.sett2; // Krever data i sett1 og sett2

            if (hasRequiredSetScores) {
                settlist.style.display = "grid";
                const settdivnode = settlist.querySelector(".settdiv");
                let columnCount = 0;
                let team1SetsWon = 0;
                let team2SetsWon = 0;

                // Legg til sett-resultater for sett1, sett2 og evt. sett3
                for (let i = 0; i < setKeys.length; i++) {
                    if (match[setKeys[i]]) {
                        const settdiv = settdivnode.cloneNode(true);
                        const setttextlable = settdiv.querySelector(".setttextlable");
                        setttextlable.textContent = match[setKeys[i]];

                        // Beregn vinner av settet
                        const [team1Score, team2Score] = match[setKeys[i]].split('-').map(Number);
                        if (team1Score > team2Score) {
                            team1SetsWon++;
                        } else if (team2Score > team1Score) {
                            team2SetsWon++;
                        }

                        settlist.appendChild(settdiv);
                        columnCount++;
                    }
                }

                settdivnode.remove(); // Fjern malen etter bruk
                settlist.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`; // Dynamisk antall kolonner

                // Sjekk stillingen på bakgrunn av vunnet og tapt sett
                match.goalteam1 = team1SetsWon;
                match.goalteam2 = team2SetsWon;
                settlist.style.display = "none";
            } else {
                // Hvis ikke sett verdi finnes, skjul settlisten
                settlist.style.display = "none";
            }

            const resultlable = matchelement.querySelector(".resultlable");

            // Hvis kampen er spilt, vis resultatet; ellers, vis klokkeslettet
            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                resultlable.style.fontWeight = "bold";
                resultlable.style.color = mapColors("main");
                resultlable.style.fontSize = "16px";
            } else {
                resultlable.textContent = formatdatetoTime(match.time);
                resultlable.style.fontWeight = "normal";

                // Sett første kamp som ikke er spilt hvis ikke allerede satt
                if (!firstUnplayedMatch) {
                    firstUnplayedMatch = matchelement;
                }
            }

            // Hvis det er den siste kampen i gruppen, fjern `border-bottom`
            if (item.matches.indexOf(match) === item.matches.length - 1) {
            matchelement.style.borderBottom = 'none';
}


            matchlist.appendChild(matchelement);
        }

        // Fjern nodematchholder-malen etter bruk
        matchholder.remove();

        list.appendChild(rowelement);
        }

      // Scroll til første kamp som ikke er spilt, hvis den finnes, med en forsinkelse
        if (scroll && firstUnplayedMatch) {
            setTimeout(() => {
                // Scroll til første kamp
                firstUnplayedMatch.scrollIntoView({ behavior: "smooth", block: "center" });

                // Vent til scrollingen er fullført og lagre scrollposisjonen
                setTimeout(() => {
                    // Finn nærmeste scroll-container
                    let scrollContainer = firstUnplayedMatch.parentElement;
                    while (scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
                        scrollContainer = scrollContainer.parentElement;
                    }

                    // Hvis vi fant en scroll-container, lagre posisjonen etter scrollingen
                    if (scrollContainer) {
                        scrollPositions[1] = scrollContainer.scrollTop;
                    }
                }, 500); // Juster denne forsinkelsen for å gi tid til scrollingen
            }, 500);
        }



}
