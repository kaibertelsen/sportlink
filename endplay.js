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

    const list = document.getElementById("endplaylist");
    list.replaceChildren(); // Fjern eksisterende innhold i listen
    const elementLibrary = document.getElementById("elementlibrary");

    for (let division of divisjon) {
        // Sjekk om endplay eksisterer i divisjonen
        if (division.endplay && Array.isArray(division.endplay)) {
            let endplays = division.endplay;

            for (let endplay of endplays) {
                let endplayname = endplay.endplayname;
                let finalecount = endplay.finalecount;

                // Kopier elementer basert på finalecount
                if (finalecount === 8) {
                    let eighthFinalElement = elementLibrary.querySelector(".8finale").cloneNode(true);
                    list.appendChild(eighthFinalElement);
                }

                if (finalecount >= 4) {
                    let quarterFinalElement = elementLibrary.querySelector(".4finale").cloneNode(true);
                    list.appendChild(quarterFinalElement);
                }

                // Kopier semifinaleholder
                let semiFinalElement = elementLibrary.querySelector(".semi").cloneNode(true);
                list.appendChild(semiFinalElement);

                // Kopier finaleholder
                let finalElement = elementLibrary.querySelector(".finale").cloneNode(true);
                list.appendChild(finalElement);
            }
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