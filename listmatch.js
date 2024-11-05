function listmatch(data, grouptype) {
    // Sorter på `time`-feltet
    let matchs = sortDateArray(data, "time");

    // Grupper kamper basert på valgt type (f.eks. etter dato)
    let grouparray = [];
    if (grouptype === "dato") {
        grouparray = groupArraybyDate(matchs);
    }

    const list = document.getElementById("matchlistholder");
    list.replaceChildren(); // Tøm eksisterende innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');

    let scrollDone = false; // Flag for å sikre at vi kun scroller til første kamp som ikke er spilt

    for (let item of grouparray) {
        // Lag en kopi av `groupholder` for hver gruppe
        const rowelement = nodeelement.cloneNode(true);

        // Angi handling ved klikk på gruppen (for eksempel, last turnering)
        rowelement.onclick = function() {
            // loadTourment(item);
        };

        // Sett gruppenavn til datoen på norsk format
        const nameelement = rowelement.querySelector(".groupheadername");
        nameelement.textContent = formatDateToNorwegian(item.date);

        const contentholder = rowelement.querySelector(".contentholder");
        contentholder.replaceChildren(); // Fjern eksisterende kampelementer

        const nodematchholder = elementlibrary.querySelector('.matchholder');

        let rownr = 0;
        for (let match of item.matches) {
            const matchelement = nodematchholder.cloneNode(true);
            if (rownr > 0) {
                matchelement.classList.remove("n1"); // Fjerne `n1`-klassen for etterfølgende rader
            }

            // Lag 1 navn og logo
            const team1name = matchelement.querySelector(".team1");
            team1name.textContent = match.team1name;

            const logoteam1 = matchelement.querySelector(".logoteam1");
            logoteam1.removeAttribute('srcset');
            logoteam1.src = match.team1clublogo[0];

            // Lag 2 navn og logo
            const team2name = matchelement.querySelector(".team2");
            team2name.textContent = match.team2name;

            const logoteam2 = matchelement.querySelector(".logoteam2");
            logoteam2.removeAttribute('srcset');
            logoteam2.src = match.team2clublogo[0];

            // Oppdater timelable: vis resultat som fet skrift hvis kampen er spilt
            const timelable = matchelement.querySelector(".timelable");
            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                timelable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                timelable.style.fontWeight = "bold"; // Gjør teksten fet
            } else {
                timelable.textContent = formatdatetoTime(match.time);
                timelable.style.fontWeight = "normal"; // Sett til normal tekst hvis ingen resultat
                
                // Scroll til første kamp uten resultat
                if (!scrollDone) {
                    matchelement.scrollIntoView({ behavior: "smooth", block: "center" });
                    scrollDone = true; // Sett flag for å sikre at vi kun scroller til den første
                }
            }

            contentholder.appendChild(matchelement);
            rownr++;
        }

        // Legg til gruppen i hovedlisten
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

