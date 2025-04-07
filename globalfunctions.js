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
    const baseUrl = "https://sportlink.app"; // Base URL

    // Build query parameters from the keys object
    const queryParams = new URLSearchParams(keys).toString();

    // Generate the full sharing link
    const sharingLink = `${baseUrl}?${queryParams}`;

    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            url: sharingLink // Share only the URL
        })
        .then(() => {
            console.log("Sharing completed!");
        })
        .catch((err) => {
            console.error("Sharing failed: ", err);
        });
    } else {
        // Fallback: Copy the link to the clipboard
        navigator.clipboard.writeText(sharingLink)
            .then(() => {
                alert("The sharing link has been copied to the clipboard!");
            })
            .catch((err) => {
                console.error("Could not copy the link: ", err);
            });
    }

    // Return the link (optional, for further use)
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
        midlemain:"middlemain"
    };

    // Sjekk om `typeColor` finnes i `colorMap`
    if (colorMap[typeColor]) {
        return getPageColor(colorMap[typeColor]);
    } else {
        // Returner en standardfarge (for eksempel svart) hvis `typeColor` ikke finnes
        return "#000000";
    }
}



function isThisMacthPlayed(match){

    if ((match.goalteam1 === "" || match.goalteam1 === null) || 
    (match.goalteam2 === "" || match.goalteam2 === null)) {
        return false;
    } else {
        return true;
    }
}


function startLoadTimer() {
    iSAlreadyLoaded = true;

    setTimeout(() => {
        iSAlreadyLoaded = false;
    }, 20000); // 20 sekunder = 20000 millisekunder
}