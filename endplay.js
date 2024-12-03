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

                // Klon elementer basert på tilgjengelighet
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

                // Legg til elementer i ønsket rekkefølge
                if (eighthFinalElement) list.appendChild(eighthFinalElement);
                if (quarterFinalElement) list.appendChild(quarterFinalElement);
                if (semiFinalElement) list.appendChild(semiFinalElement);
                if (finalElement) list.appendChild(finalElement);
                if (semiFinalBottomElement) list.appendChild(semiFinalBottomElement);
                if (quarterFinalBottomElement) list.appendChild(quarterFinalBottomElement);
                if (eighthFinalBottomElement) list.appendChild(eighthFinalBottomElement);
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