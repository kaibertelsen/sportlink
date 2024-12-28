function endplayConverter(data) {

    // Sjekk om data har en "divisjonjson"-nøkkel som er en array
    if (Array.isArray(data?.divisjonjson)) {
        const parsedData = data.divisjonjson.map(item => {
            // Forsøk å parse hvert element i divisjon-arrayet
            try {
                const sanitizedItem = item.replace(/\\\"/g, '"').replace(/\\\\/g, '\\');
                const parsedItem = JSON.parse(sanitizedItem);
                
                // Parse "endplay" hvis det er en gyldig JSON-streng
                if (parsedItem.endplay) {
                    parsedItem.endplay = parsedItem.endplay;
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
                            contentholderlist.style.transition = "opacity 0.5s ease-in-out, height 0.5s ease-in-out, padding 0.5s ease-in-out";
                            contentholderlist.style.opacity = "1";
                            contentholderlist.style.height = (contentholderlist.scrollHeight+20) + "px";
                            contentholderlist.style.paddingTop = "10px";
                            contentholderlist.style.paddingBottom = "10px";
                        }, 0);
                    } else {
                        contentholderlist.style.transition = "opacity 0.5s ease-in-out, height 0.5s ease-in-out, padding 0.5s ease-in-out";
                        contentholderlist.style.opacity = "0";
                        contentholderlist.style.height = "0px";
                        contentholderlist.style.paddingTop = "0px";
                        contentholderlist.style.paddingBottom = "0px";
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

                let semiFinalElement = elementLibrary.querySelector(".semi1")?.cloneNode(true);
                let semiFinalBottomElement = elementLibrary.querySelector(".semi1.bottom")?.cloneNode(true);
                let finalElement = elementLibrary.querySelector(".finale")?.cloneNode(true);

                // Last inn kamper i hvert element
                if (eighthFinalElement) loadEndplaysection(eighthFinalElement, filteredMatches,"eighthfinale",endplayname,division,  1);
                if (eighthFinalBottomElement) loadEndplaysection(eighthFinalBottomElement, filteredMatches, "eighthfinale",endplayname,division, 5);
                if (quarterFinalElement) loadEndplaysection(quarterFinalElement, filteredMatches,"quarterfinale",endplayname,division,  1);
                if (quarterFinalBottomElement) loadEndplaysection(quarterFinalBottomElement, filteredMatches, "quarterfinale",endplayname,division, 3);
                if (semiFinalElement) loadEndplaysection(semiFinalElement, filteredMatches, "semifinale", endplayname,division,1);
                if (semiFinalBottomElement) loadEndplaysection(semiFinalBottomElement, filteredMatches, "semifinale",endplayname,division, 2);
                if (finalElement) {
                    let endplayNamef = finalElement.querySelector(".endplaynamemidle");
                    if (endplayNamef) endplayNamef.textContent = endplayname;
                    
                    let endplayDivname = finalElement.querySelector(".divisionnamemidle");
                    if (endplayDivname) endplayDivname.textContent = division.name;
                    
                    loadEndplaysection(finalElement, filteredMatches, "finale",endplayname,division, 1);
                    //hvis det er bronsefinale
                    loadEndplaysection(finalElement, filteredMatches, "bronzefinale",endplayname,division, 2);
                }
                // Skjul spesifikke elementer i quarterFinalElement og quarterFinalBottomElement
                if (finalecount <= 4) {
                    if (quarterFinalElement) {
                        let topWireElements = quarterFinalElement.querySelectorAll(".wiresystem.topp");
                        topWireElements.forEach(el => (el.style.display = "none"));
                    }
            
                    if (quarterFinalBottomElement) {
                        let bottomWireElements = quarterFinalBottomElement.querySelectorAll(".wiresystem.bottom");
                        bottomWireElements.forEach(el => (el.style.display = "none"));
                    }
                    if(finalecount <= 2){
                        if(semiFinalElement){
                            let topWireElements = semiFinalElement.querySelectorAll(".wiresystem.topp");
                            topWireElements.forEach(el => (el.style.display = "none"));
                        }

                        if(semiFinalElement){
                            let topWireElements = semiFinalBottomElement.querySelectorAll(".wiresystem.bottom");
                            topWireElements.forEach(el => (el.style.display = "none"));
                        }
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


                //sjekke om det er bronsefinale registrert og om ikke semiFinalElement er synlig
                //da må tekstelementet fjernes
                let isBronzfinalematchinThisEndplay = filteredMatches.filter(match => 
                    (match.typematch === "bronzefinale") &&
                    (match.endplay === endplayname) &&
                    (match.division === division.airtable)
                );

                if (isBronzfinalematchinThisEndplay.length > 0) {
                    // Det er bronsefinale
                
                    // Sjekk om semiFinalElement er synlig
                    const isSemiFinalVisible = semiFinalElement.style.display !== "none" && semiFinalElement.offsetParent !== null;
                
                    if (isSemiFinalVisible) {
                        console.log("semiFinalElement er synlig");
                    } else {
                        let textholder = finalElement.querySelector(".enplaytext");
                        textholder.style.display = "none";
                    }
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




function loadEndplaysection(eighthFinalElement, listMatches, typematch, endplayName,division, startIndex) {
   
    let filteredMatches = listMatches.filter(match => 
        (typematch === "" || match.typematch === typematch) &&
        (endplayName === "" || match.endplay === endplayName) &&
        (division === "" || match.division === division.airtable)
    );
    
   //er det ikke noen kampen kan hele section hides
  


    // Hent alle elementer med klassen "endplaymatch" i eighthFinalElement
    const endplayMatches = eighthFinalElement.querySelectorAll(".endplaymatch");
    
    if(filteredMatches.length == 0 && typematch != "bronzefinale" && typematch != "finale"){
        //det er ingen kamper så skjul hele endplay section
        eighthFinalElement.style.display = "none";
    }

    let countMatches = 0;

    // Loop gjennom hvert "endplaymatch"-element
    for(var index = 0;index<endplayMatches.length;index++) {
        let matchElement = endplayMatches[index];
        // Finn match hvor `index + startIndex` tilsvarer `endplayplace`
        let matchData = filteredMatches.find(match => Number(match.endplayplace) === index + startIndex);
        if(typematch == "finale"){
            matchElement = endplayMatches[0];
            matchData = filteredMatches[0];
            index ++
            countMatches ++
        }else if (typematch == "bronzefinale") {
            matchElement = endplayMatches[1];
            index ++
            countMatches ++
            if (filteredMatches.length > 0){
                //er det ingen kamp registrert her
                // Da er det bare én kamp
                matchData = filteredMatches[0];
                
                // Synliggjør denne kampenholderen
                eighthFinalElement.querySelector(".bronzeholder").style.display = "flex";
                
                // Sett sluttspilltekst til en annen posisjon men sjekk om det er simifinaler her
                let textholder = eighthFinalElement.querySelector(".enplaytext");
                textholder.style.position = "absolute"; // Sørg for at den kan flyttes med topp/venstre/høyre/bunn
                textholder.style.left = "auto";
                textholder.style.right = "35px";
                textholder.style.top = "-100px";
                textholder.style.bottom = "auto";
            }else{
                // ingen kamper registrert Stopp løkken
                break;
            }
            
        }
        
        const finalename = matchElement.querySelector(".finalename");

        const matchTypeMap = {
            "eighthfinale": "8-delsfinale",
            "quarterfinale": "Kvartfinale",
            "semifinale": "Semifinale",
            "bronzefinale": "Bronsefinale",
            "finale": "Finale"
        };

        finalename.textContent = matchTypeMap[typematch];



        if (!matchData) {
            matchElement.parentElement.parentElement.style.opacity = "0.0"
            break; // Hopp over hvis ingen kamp er funnet
        }
        countMatches++

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
        if (!isThisMacthPlayed(matchData)) {
            // Vis datelable og oppdater tekst
            if (datelable) {
                // Sett inn tid og dato på separate linjer
                datelable.innerHTML = formatdatetoDateAndTimeshortInToLines(matchData.time);
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

        //hvis det foreligger resultat i en finalekamp
        if(typematch == "finale" && (matchData.goalteam1 || matchData.goalteam2)){
           
            const teamnamevinner = eighthFinalElement.querySelector(".teamnamevinner");
            const winnerlogo = eighthFinalElement.querySelector(".winnerlogo");

            if(matchData.goalteam1>matchData.goalteam2){
                //lag1 har vunnet
                winnerlogo.src = matchData.team1clublogo;
                teamnamevinner.textContent = matchData.team1name;

            }else if(matchData.goalteam1<matchData.goalteam2){
                //lag2 har vunnet
                winnerlogo.src = matchData.team2clublogo;
                teamnamevinner.textContent = matchData.team2name;
            }
        }
    };

    if(countMatches == 0){
        eighthFinalElement.style.display = "none"; 
    }

    function createInitials(name, existingInitials) {
        if (existingInitials) return existingInitials.toUpperCase();
    
        // Fjern mellomrom i starten og slutten av navnet
        name = name.trim();
    
        const words = name.split(' ');
        let initials = "";
    
        if (words.length > 1) {
            // Hvis siste ord er et tall, bruk det som det tredje tegnet
            const lastWord = words[words.length - 1];
            if (!isNaN(lastWord)) {
                initials = words.slice(0, -1).map(word => word[0]).join('').toUpperCase() + lastWord;
            } else {
                // Lag initialer fra første bokstav i hvert ord
                initials = words.map(word => word[0]).join('').toUpperCase();
            }
        } else {
            // Bruk de første 3 tegnene i navnet
            initials = name.slice(0, 3).toUpperCase();
        }
    
        // Sørg for at initialene er nøyaktig 3 tegn
        return initials.slice(0, 3).toUpperCase();
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


