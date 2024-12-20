function sortArrayABC(Array,key) {
    return Array.sort((a, b) => {
      const nameA = a[key].toLowerCase();
      const nameB = b[key].toLowerCase();
  
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }


  function makeObjectFromAirtableJSON(data, key) {
    if (data[key]) {
        let jsonArray = data[key];
        console.log(jsonArray);

        try {
            let parsedObjects = jsonArray.map(item => {
                let obj = JSON.parse(item);

                // Fjern nøkler med verdien "null" eller null
                Object.keys(obj).forEach(key => {
                    if (obj[key] === "null" || obj[key] === null) {
                        delete obj[key];
                    }
                });

                console.log("Parsed and cleaned object:", obj);
                return obj;
            });

            console.log(parsedObjects);
            return parsedObjects;
        } catch (error) {
            console.error("Feil ved parsing av JSON-strenger:", error);
            return false;
        }
    }
    return false;
}

function generateSharingLink(keys) {
    const baseUrl = "https://sportlink.app"; // Basen for URL-en

    // Bygg query-parametere fra keys-objektet
    const queryParams = new URLSearchParams(keys).toString();

    // Generer den fullstendige delingslinken
    const sharingLink = `${baseUrl}?${queryParams}`;

    // Sjekk om Web Share API er tilgjengelig
    if (navigator.share) {
        navigator.share({
            title: "Del lenke fra SportLink",
            text: "Sjekk ut denne lenken fra SportLink!",
            url: sharingLink
        })
        .then(() => {
            console.log("Deling fullført!");
        })
        .catch((err) => {
            console.error("Deling feilet: ", err);
        });
    } else {
        // Fallback: Kopier lenken til utklippstavlen
        navigator.clipboard.writeText(sharingLink)
            .then(() => {
                alert("Delingslinken er kopiert til utklippstavlen!");
            })
            .catch((err) => {
                console.error("Kunne ikke kopiere lenken: ", err);
            });
    }

    // Returner lenken (valgfritt, for videre bruk)
    return sharingLink;
}



function getQueryParams() {
    // Hent hele query-delen av URL-en
    const params = new URLSearchParams(window.location.search);

    // Opprett et objekt for å lagre alle nøkkel-verdi-par
    const queryParams = {};

    // Iterer gjennom alle parametere i URL-en
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }

    // Returner objektet med alle nøklene
    return queryParams;
}



function markActiveButton(button) {
    // Finn alle child-elementer av samme parent som `button`
    const parentElement = button.parentElement;
    const allChildren = parentElement.querySelectorAll('*'); // Velger alle barn

    // Lagre opprinnelig farge for alle barn
    allChildren.forEach(child => {
        const originalColor = getComputedStyle(child).color;
        child.dataset.originalColor = originalColor; // Lagre opprinnelig farge i `data`-attributt
    });

    // Nullstill `border-bottom` og tekstfarge for alle barn
    allChildren.forEach(child => {
        child.style.borderBottom = '4px solid transparent';
        child.style.color = child.dataset.originalColor; // Sett tilbake til opprinnelig farge
    });

    // Marker den aktive knappen med grønn bottom border og hvit tekstfarge
    button.style.borderBottom = '4px solid '+mapColors("border");
    button.style.color = '#fff'; // Sett tekstfargen til hvit
}


function getPageColor(variableName) {
    const colorName = `--${variableName}`;
    const colorSpec = getComputedStyle(document.documentElement).getPropertyValue(colorName).trim();
    return colorSpec || '#000000'; // Returner en fallback farge hvis variabelen ikke er definert
}

function mapColors(typeColor) {
    // Definer fargekartet med riktige variabelnavn
    const colorMap = {
        main: "bluemarking",
        second: "bluemarkingdark",
        element: "elementgray",
        elementactive: "hoverelement",
        border: "bluemarking",
        textoff:"textoff",
        blueblack:"blueblack",
    };

    // Sjekk om `typeColor` finnes i `colorMap`
    if (colorMap[typeColor]) {
        return getPageColor(colorMap[typeColor]);
    } else {
        // Returner en standardfarge (for eksempel svart) hvis `typeColor` ikke finnes
        return "#000000";
    }
}
