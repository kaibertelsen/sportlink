function endplayConverter(data) {

    // Sjekk om data har en "divisjonjson"-nøkkel som er en array
    if (Array.isArray(data?.divisjonjson)) {
        const parsedData = data.divisjonjson.map(item => {
            // Forsøk å parse hvert element i divisjon-arrayet
            try {
                const sanitizedItem = item.replace(/\\\"/g, '"').replace(/\\\\/g, '\\');
                const parsedItem = JSON.parse(sanitizedItem);
                
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

            // Legg til divisjonsnavnet
            if (endplays.length > 0) {
                let divisionNameLable = elementLibrary.querySelector(".divisionname")?.cloneNode(true);
                divisionNameLable.textContent = division.name;
                list.appendChild(divisionNameLable);
            }

            for (let endplay of endplays) {
                let endplayname = endplay.endplayname;
                let finalecount = endplay.finalecount;

                // Klon container og sett inn verdier
                let endplayContainer = elementLibrary.querySelector(".endplayheaderendplay")?.cloneNode(true);
                if (!endplayContainer) continue;

                
                let header = endplayContainer.querySelector(".headerholder");
                  // Legg til animasjon ved klikk på header
                
                  header.addEventListener("click", () => {
                    if (contentholderlist.style.height === "0px") {
                        setTimeout(() => {
                            contentholderlist.style.transition = "opacity 0.5s ease-in-out, height 0.5s ease-in-out";
                            contentholderlist.style.opacity = "1";
                            contentholderlist.style.height = contentholderlist.scrollHeight + "px";
                        }, 0);
                    } else {
                        contentholderlist.style.transition = "opacity 0.5s ease-in-out, height 0.5s ease-in-out";
                        contentholderlist.style.opacity = "0";
                        contentholderlist.style.height = "0px";
                    }
                });

        
                let contentholderlist = endplayContainer.querySelector(".contentholder");

                let endplayNameElement = endplayContainer.querySelector(".endplayname");
                if (endplayNameElement) endplayNameElement.textContent = endplayname;

                list.appendChild(endplayContainer); // Legg til header

                // Klon og last inn data i elementer
                let eighthFinalElement = finalecount === 8
                    ? elementLibrary.querySelector(".eighthfinalelement")?.cloneNode(true)
                    : null;

                let eighthFinalBottomElement = finalecount === 8
                    ? elementLibrary.querySelector(".eighthfinalelement.bottom")?.cloneNode(true)
                    : null;

                let quarterFinalElement = finalecount >= 4
                    ? elementLibrary.querySelector(".quarterfinalelement")?.cloneNode(true)
                    : null;

                let quarterFinalBottomElement = finalecount >= 4
                    ? elementLibrary.querySelector(".quarterfinalelement.bottom")?.cloneNode(true)
                    : null;

                let semiFinalElement = elementLibrary.querySelector(".semi")?.cloneNode(true);
                let semiFinalBottomElement = elementLibrary.querySelector(".semi.bottom")?.cloneNode(true);
                let finalElement = elementLibrary.querySelector(".finale")?.cloneNode(true);

                // Last inn kamper i hvert element
                if (eighthFinalElement) loadEndplaysection(eighthFinalElement, filteredMatches,"eighthfinale",endplayname,  1);
                if (eighthFinalBottomElement) loadEndplaysection(eighthFinalBottomElement, filteredMatches, "eighthfinalebottom",endplayname, 5);
                if (quarterFinalElement) loadEndplaysection(quarterFinalElement, filteredMatches,"quarterfinale",endplayname,  1);
                if (quarterFinalBottomElement) loadEndplaysection(quarterFinalBottomElement, filteredMatches, "quarterfinalebottom",endplayname, 3);
                if (semiFinalElement) loadEndplaysection(semiFinalElement, filteredMatches, "semifinal", endplayname,1);
                if (semiFinalBottomElement) loadEndplaysection(semiFinalBottomElement, filteredMatches, "semifinalbottom",endplayname, 2);
                if (finalElement) {
                    let endplayNamef = finalElement.querySelector(".endplaynamemidle");
                    if (endplayNamef) endplayNamef.textContent = endplayname;
                    
                    let endplayDivname = finalElement.querySelector(".divisionnamemidle");
                    if (endplayDivname) endplayDivname.textContent = division.name;
                    
                    loadEndplaysection(finalElement, filteredMatches, "finale",endplayname, 1);
                }
                // Skjul spesifikke elementer i quarterFinalElement og quarterFinalBottomElement
                if (finalecount === 4) {
                    if (quarterFinalElement) {
                        let topWireElements = quarterFinalElement.querySelectorAll(".wiresystem.topp");
                        topWireElements.forEach(el => (el.style.display = "none"));
                    }
                    if (quarterFinalBottomElement) {
                        let bottomWireElements = quarterFinalBottomElement.querySelectorAll(".wiresystem.bottom");
                        bottomWireElements.forEach(el => (el.style.display = "none"));
                    }
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

                if(activeDivision == ""){
                    contentholderlist.style.height = "0px";
                    contentholderlist.style.opacity = "0";
                }else{
                    contentholderlist.style.opacity = "1";
                    contentholderlist.style.height = contentholderlist.scrollHeight + "px";
                }



            }
        }
    }
}




function loadEndplaysection(eighthFinalElement, listMatches, typematch, endplayName, startIndex) {
    // Filtrer matcher basert på typematch
    let filteredMatches = typematch === "" ? listMatches : listMatches.filter(match => match.typematch === typematch);

    // Hent alle elementer med klassen "endplaymatch" i eighthFinalElement
    const endplayMatches = eighthFinalElement.querySelectorAll(".endplaymatch");

    // Loop gjennom hvert "endplaymatch"-element
    endplayMatches.forEach((matchElement, index) => {
        // Finn match hvor `index + startIndex` tilsvarer `endplayplace`
        const matchData = filteredMatches.find(match => Number(match.endplayplace) === index + startIndex);
        if (!matchData) return; // Hopp over hvis ingen kamp er funnet

        // Sjekk om match har riktig `endplayName`
        if (matchData.endplay !== endplayName) return;

        // Legg til klikkhendelse for å starte `viewMatch(matchData)`
        matchElement.addEventListener("click", () => {
            previouspage = "";
             viewMatch(matchData);
        });

        // Hent spesifikke elementer inne i matchElement
        const logo1 = matchElement.querySelector(".logo1");
        const logo2 = matchElement.querySelector(".logo2");
        const inis1 = matchElement.querySelector(".inis1");
        const inis2 = matchElement.querySelector(".inis2");
        const goal1 = matchElement.querySelector(".goal1");
        const goal2 = matchElement.querySelector(".goal2");
        const datelable = matchElement.querySelector(".datelable");
        const lablemidt = matchElement.querySelector(".lablemidt");

        // Oppdater logoer (kun hvis det finnes en verdi)
        if (logo1 && matchData.team1clublogo) logo1.src = matchData.team1clublogo;
        if (logo2 && matchData.team2clublogo) logo2.src = matchData.team2clublogo;

        // Oppdater inisialer for lag 1 eller bruk placeholder
        if (inis1) {
            const team1Name = matchData.team1name || matchData.placeholderteam1 || "Unknown";
            inis1.textContent = createInitials(team1Name, matchData.initials1);
        }

        // Oppdater inisialer for lag 2 eller bruk placeholder
        if (inis2) {
            const team2Name = matchData.team2name || matchData.placeholderteam2 || "Unknown";
            inis2.textContent = createInitials(team2Name, matchData.initials2);
        }

        // Oppdater mål eller vis dato hvis ingen resultat
        if (matchData.goalteam1 === undefined || matchData.goalteam2 === undefined) {
            // Vis datelable og oppdater tekst
            if (datelable) {
                const matchTime = new Date(matchData.time);

                // Hent klokkeslett og dato hver for seg
                const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false }; // Sikrer 24-timers format
                const dateOptions = { day: '2-digit', month: 'short' }; // Sørger for korrekt datoformat

                const timeString = matchTime.toLocaleTimeString('no-NO', timeOptions); // Format tid
                const dateString = matchTime.toLocaleDateString('no-NO', dateOptions).replace('.', ''); // Format dato og fjern punktum

                // Sett inn tid og dato på separate linjer
                datelable.innerHTML = `${timeString}<br>${dateString}`;
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

    // Funksjon for å lage initialer
    function createInitials(name, existingInitials) {
        if (existingInitials) return existingInitials.toUpperCase();
        const words = name.split(' ');
        if (words.length > 1) {
            return words.map(word => word[0]).join('').toUpperCase().slice(0, 3);
        } else {
            return name.slice(0, 3).toUpperCase();
        }
    }
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