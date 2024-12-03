
function endplayConverter(data) {
    // Sjekk om data har en "divisjon"-nøkkel som er en array
    if (Array.isArray(data?.divisjonjson)) {
        const parsedData = data.divisjonjson.map(item => {
            // Forsøk å parse hvert element i divisjon-arrayet
            try {
                const parsedItem = JSON.parse(item);

                // Parse "endplay" hvis det er en gyldig JSON-streng
                if (parsedItem.endplay) {
                    try {
                        parsedItem.endplay = JSON.parse(parsedItem.endplay);
                    } catch (error) {
                        console.warn("Feil ved parsing av endplay:", error);
                    }
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
        console.warn("Data mangler en gyldig divisjon-array.");
        return [];
    }
}








function listendplay(data,endplay) {

    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    

    const list = document.getElementById("endplaylist");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    //const nodeelement = elementlibrary.querySelector('.groupholder');

    for (let item of grouparray) {
        //const rowelement = nodeelement.cloneNode(true);
        //list.appendChild(rowelement);
    }
    
}