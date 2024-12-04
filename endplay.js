function endplayConverter(data) {
    // Sjekk om data har en "divisjonjson"-nøkkel som er en array
    if (Array.isArray(data?.divisjonjson)) {
        const parsedData = data.divisjonjson.map(item => {
            // Forsøk å parse hvert element i divisjon-arrayet
            try {
                const parsedItem = JSON.parse(item);

                // Parse "endplay" hvis det er en gyldig JSON-streng
                if (parsedItem.endplay && parsedItem.endplay.trim()) {
                    try {
                        parsedItem.endplay = JSON.parse(parsedItem.endplay);
                    } catch (error) {
                        console.warn("Feil ved parsing av endplay:", error);
                    }
                } else {
                    // Hvis endplay er tomt, sett det til en tom array
                    parsedItem.endplay = [];
                }

                return parsedItem;
            } catch (error) {
                console.warn("Feil ved parsing av element:", error, item);
                return null; // Returner null for elementer som feiler
            }
        });

        // Filtrer ut null-verdier fra resultatet
        return parsedData.filter(item => item !== null);
    } else {
        console.warn("Data mangler en gyldig divisjonjson-array.");
        return [];
    }
}




function listendplay(data, divisjon) {
    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    let filteredDivision = activeDivision === "" ? divisjon : divisjon.filter(div => div.airtable === activeDivision);


    const list = document.getElementById("endplaylist");
    list.replaceChildren(); // Fjern eksisterende innhold i listen
    const elementLibrary = document.getElementById("elementlibrary");

    for (let division of filteredDivision) {
        // Sjekk om endplay eksisterer i divisjonen
        if (division.endplay && Array.isArray(division.endplay)) {
            let endplays = division.endplay;

            //legger til divisjonsnavnet
            if(endplays.length>0){
            let divisionNameLable = elementLibrary.querySelector(".divisionname")?.cloneNode(true);
            divisionNameLable.textContent = division.name;
            list.appendChild(divisionNameLable);
            }

            for (let endplay of endplays) {
                let endplayname = endplay.endplayname;
                let finalecount = endplay.finalecount;

                // Klon header og sett inn verdier
                let header = elementLibrary.querySelector(".endplayheaderendplay")?.cloneNode(true);
                if (!header) continue;

                let contentholderlist = header.querySelector(".contentholder");
                //contentholderlist.style.display = "none"; // Start som skjult
                contentholderlist.style.height = "0px";
                contentholderlist.style.opacity = "0";

                // Legg til animasjon ved klikk på header
                header.addEventListener("click", () => {
                    if (contentholderlist.style.height === "0px") {
                        // Fade og utvid høyden
                        setTimeout(() => {
                            contentholderlist.style.transition = "opacity 0.5s ease-in-out, height 0.5s ease-in-out";
                            contentholderlist.style.opacity = "1";
                            contentholderlist.style.height = contentholderlist.scrollHeight + "px"; // Sett til høyden på innholdet
                        }, 0);
                    } else {
                        // Krymp høyden og fade ut
                        contentholderlist.style.transition = "opacity 0.5s ease-in-out, height 0.5s ease-in-out";
                        contentholderlist.style.opacity = "0";
                        contentholderlist.style.height = "0px";
                    }
                });

                let endplayNameElement = header.querySelector(".endplayname");
                if (endplayNameElement) endplayNameElement.textContent = endplayname;

                list.appendChild(header); // Legg til header

                // Klon elementer basert på tilgjengelighet
                let eighthFinalElement = finalecount === 8 
                    ? elementLibrary.querySelector(".eighthfinalelement")?.cloneNode(true)
                    : null;
                //last inn funnete finalekamper i eighthFinalElement
                loadEndplaysection(eighthFinalElement,filteredMatches,"eighthfinale");
                let eighthFinalBottomElement = finalecount === 8 
                    ? elementLibrary.querySelector(".eighthfinalelement.bottom")?.cloneNode(true)
                    : null;

                let quarterFinalElement = finalecount >= 4 
                    ? elementLibrary.querySelector(".quarterfinalelement")?.cloneNode(true)
                    : null;

                let quarterFinalBottomElement = finalecount >= 4 
                    ? elementLibrary.querySelector(".quarterfinalelement.bottom")?.cloneNode(true)
                    : null;

                if (finalecount === 4) {
                    // Skjul spesifikke elementer i quarterFinalElement
                    if (quarterFinalElement) {
                        let topWireElements = quarterFinalElement.querySelectorAll(".wiresystem.topp");
                        topWireElements.forEach(el => (el.style.display = "none"));
                    }
                    if (quarterFinalBottomElement) {
                        let bottomWireElements = quarterFinalBottomElement.querySelectorAll(".wiresystem.bottom");
                        bottomWireElements.forEach(el => (el.style.display = "none"));
                    }
                }

                let semiFinalElement = elementLibrary.querySelector(".semi")?.cloneNode(true);
                let semiFinalBottomElement = elementLibrary.querySelector(".semi.bottom")?.cloneNode(true);
                let finalElement = elementLibrary.querySelector(".finale")?.cloneNode(true);

                if (finalElement) {
                    let finalElementName = finalElement.querySelector(".endplayname");
                    let finalDivisionMidName = finalElement.querySelector(".divisionnamemidle");
                    if (finalElementName) finalElementName.textContent = endplayname;
                    if (finalDivisionMidName) finalDivisionMidName.textContent = division.name;
                }

                // Legg til elementer i ønsket rekkefølge
                if (contentholderlist) {
                    if (eighthFinalElement) contentholderlist.appendChild(eighthFinalElement);
                    if (quarterFinalElement) contentholderlist.appendChild(quarterFinalElement);
                    if (semiFinalElement) contentholderlist.appendChild(semiFinalElement);
                    if (finalElement) contentholderlist.appendChild(finalElement);
                    if (semiFinalBottomElement) contentholderlist.appendChild(semiFinalBottomElement);
                    if (quarterFinalBottomElement) contentholderlist.appendChild(quarterFinalBottomElement);
                    if (eighthFinalBottomElement) contentholderlist.appendChild(eighthFinalBottomElement);
                }
            }
        }
    }
}



function loadEndplaysection(eighthFinalElement, listMatches, typematch) {
    // Filtrer matcher basert på typematch
    let filteredMatches = typematch === "" ? listMatches : listMatches.filter(match => match.typematch === typematch);

    // Hent alle elementer med klassen "endplaymatch" i eighthFinalElement
    const endplayMatches = eighthFinalElement.querySelectorAll(".endplaymatch");

    // Loop gjennom hvert "endplaymatch"-element
    endplayMatches.forEach((matchElement, index) => {
        // Finn match hvor `index + 1` tilsvarer `endplayplace`
        const matchData = filteredMatches.find(match => match.endplayplace === index + 1);

        if (!matchData) return; // Hopp over hvis ingen kamp er funnet

        // Hent spesifikke elementer inne i matchElement
        const logo1 = matchElement.querySelector(".logo1");
        const logo2 = matchElement.querySelector(".logo2");
        const inis1 = matchElement.querySelector(".inis1");
        const inis2 = matchElement.querySelector(".inis2");
        const goal1 = matchElement.querySelector(".goal1");
        const goal2 = matchElement.querySelector(".goal2");
        const datelable = matchElement.querySelector(".datelable");
        const lablemidt = matchElement.querySelector(".lablemidt");

        // Oppdater logoer
        if (logo1) logo1.src = matchData.team1clublogo || "";
        if (logo2) logo2.src = matchData.team2clublogo || "";

        // Oppdater inisialer for lag 1 eller bruk placeholder
        if (inis1) {
            const team1Name = matchData.team1name || matchData.placeholderteam1 || "Unknown";
            if (team1Name.length > 3) {
                inis1.textContent = matchData.initials1 || 
                    (team1Name.split(' ').map(word => word[0]).join('') || team1Name.slice(0, 3)).toUpperCase();
            } else {
                inis1.textContent = team1Name;
            }
        }

        // Oppdater inisialer for lag 2 eller bruk placeholder
        if (inis2) {
            const team2Name = matchData.team2name || matchData.placeholderteam2 || "Unknown";
            if (team2Name.length > 3) {
                inis2.textContent = matchData.initials2 || 
                    (team2Name.split(' ').map(word => word[0]).join('') || team2Name.slice(0, 3)).toUpperCase();
            } else {
                inis2.textContent = team2Name;
            }
        }

        // Oppdater mål eller vis dato hvis ingen resultat
        if (matchData.goalteam1 === undefined || matchData.goalteam2 === undefined) {
            // Vis datelable og oppdater tekst
            if (datelable) {
                const matchTime = new Date(matchData.time);
                const options = { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' };
                datelable.textContent = matchTime.toLocaleString('no-NO', options).replace('.', '');
                datelable.style.display = "block";
            }

            // Skjul mål og lablemidt
            if (goal1) goal1.style.display = "none";
            if (goal2) goal2.style.display = "none";
            if (lablemidt) lablemidt.style.display = "none";
        } else {
            // Oppdater mål
            if (goal1) goal1.textContent = matchData.goalteam1;
            if (goal2) goal2.textContent = matchData.goalteam2;

            // Skjul datelable
            if (datelable) datelable.style.display = "none";

            // Vis mål og lablemidt
            if (goal1) goal1.style.display = "block";
            if (goal2) goal2.style.display = "block";
            if (lablemidt) lablemidt.style.display = "block";

            // Marker tapende lag
            if (matchData.goalteam1 > matchData.goalteam2) {
                if (inis2) {
                    inis2.style.textDecoration = "line-through";
                    inis2.style.color = "gray";
                }
                if (goal2) goal2.style.color = "gray";
            } else if (matchData.goalteam1 < matchData.goalteam2) {
                if (inis1) {
                    inis1.style.textDecoration = "line-through";
                    inis1.style.color = "gray";
                }
                if (goal1) goal1.style.color = "gray";
            }
        }
    });
}









/*
{
    "name": "J16",
    "airtable": "rec5SA76Qg9zhrX3K",
    "endplay": [
        {
            "endplayname": "A",
            "finalecount": 8
        },
        {
            "endplayname": "B",
            "finalecount": 8
        }
    ]
}
*/