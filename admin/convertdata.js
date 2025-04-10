function convertImportDataTurnament(data) {
    // Konverterer dataene til riktig nøkkelnavn
    const convertedData = data.map(item => ({
        name: item.Turneringsnavn || "",
        organizer: item.Arrangement || "",
        sport: item.Sport || "",
        startdate: item.Start || "",
        enddate: item.Slutt || ""
    }));
    return convertedData;
}

function controllTurnament(turnaments) {
    let turnament = turnaments[0];

    if (turnament.SystemId) {
        // Sjekk med databasen og evt. last ned denne turneringen
        console.log("Sjekker eksisterende turnering med SystemId:", turnament.SystemId);
        // Legg til databasekall her for å hente turneringen
    } else {
        // Det er en ny turnering
        console.log("Ny turnering oppdaget.");

        // Sjekk om turnament.sport eksisterer i gSport
        // Sjekk om turnament.sport eksisterer i gSport
        const sportMatch = gSport.find(sport => {
            const sportName = sport.name.trim().toLowerCase();
            const turnamentSport = turnament.sport.trim().toLowerCase();
            return sportName === turnamentSport;
        });


        if (sportMatch) {
            console.log("Match funnet i gSport:", sportMatch);
            turnament.sport = [sportMatch.airtable];
            turnament.sportname = sportMatch.name;
        } else {
            // Hent alle navn fra gSport og formater dem med linjeskift
            const availableSports = gSport.map(sport => sport.name).join("\n");
            // Vis en advarsel med tilgjengelige sportsnavn
            importok.push(
                `Det finnes ingen sporter i systemet med navnet "${turnament.sportname}".\n` +
                `Tilgjengelige sporter er:\n${availableSports}`
            );
            
        }
        //sjekk om turnament.organize eksisterer i gOrganizer
        const organizerMatch = gOrganizer.find(organizer => {
            // Trim og konverter begge verdier til små bokstaver før sammenligning
            const organizerName = organizer.name.trim().toLowerCase();
            const turnamentOrganizer = turnament.organizer.trim().toLowerCase();
            return organizerName === turnamentOrganizer;
        });
        
        if (organizerMatch) {
            console.log("Match funnet i gOrganizer:", organizerMatch);
            turnament.organizer = [organizerMatch.airtable];
            turnament.organizername = organizerMatch.name;

        } else {
            // Hent alle navn fra gSport og formater dem med linjeskift
            const availableOrganizer = gOrganizer.map(organizer => organizer.name).join("\n");

            // Vis en advarsel med tilgjengelige sportsnavn
            importok.push(
                `Det finnes ingen arrangementer i systemet med navnet "${turnament.organizer}".\n` +
                `Tilgjengelige arrangementer er:\n${availableOrganizer}`
            );
            return false;
        }
        return turnament;
    }
}

function controllDivision(data) {
    const formattedData = data.map(division => {
        // Formater grupper som et array av objekter, eller en tom liste hvis Grupper mangler
        const groups = division.Grupper
            ? division.Grupper.split(",").map(groupName => ({ name: groupName }))
            : [];

        // Formater sluttspill som et array av objekter med navn og antall finaler, eller en tom liste hvis Sluttspill mangler
        const endplay = division.Sluttspill && division["Sluttspill-finaler"]
            ? division.Sluttspill.split(",").map((endplayName, index) => ({
                endplayname: endplayName,
                finalecount: Number(division["Sluttspill-finaler"].split(",")[index]) || 0
            }))
            : [];

        // Returner det formaterte objektet
        return {
            name: division.Divisjon || "Ukjent divisjon",
            group: groups,
            endplay: endplay
        };
    });
    return formattedData;
}


function controllTeam(data) {
    const validatedTeams = data.map((team, index) => {
        const lineNumber = index + 1; // Linjenummer i datasettet

        // Valider Lagnavn
        if (!team.Lagnavn || typeof team.Lagnavn !== "string") {
           let message = `Feil på linje ${lineNumber}: i Lag-arket, laget mangler Lagnavn eller har en ugyldig verdi. Kampdata: ${JSON.stringify(team)}`;
            importMessage.push(message);
           
        }

        // Valider Divisjon
        if (!team.Divisjon || !iDivisions.some(div => div.name === team.Divisjon)) {
            let message = `Feil på linje ${lineNumber}:i Lag-arket, ugyldig eller manglende divisjon for laget ${team.Lagnavn}. Divisjon: ${team.Divisjon}`
            importMessage.push(message);
           

        }

        // Valider Klubb
        let clubid = "";
        if (team.Klubb) {
            const clubExists = gClub.some(club => 
                club.name.toLowerCase().trim() === team.Klubb.toLowerCase().trim()
            );
            
            if (!clubExists) {
                // Generer en alfabetisk liste over mulige klubber
                const availableClubs = gClub
                    .map(club => club.name)
                    .sort((a, b) => a.localeCompare(b)) // Sorter alfabetisk
                    .join("\n"); // Legg til linjeskift mellom navnene

                importMessage.push(
                    `Feil på linje ${lineNumber}: i Lag-arket, klubb '${team.Klubb}' finnes ikke i systemet for laget ${team.Lagnavn}.\n` +
                    `Mulige klubber som ligger inne i systemet nå er:\n${availableClubs}`
                );
               
            }else{
                clubid =  clubExists.airtable;
            }
        }

        // Valider Gruppe
        if (team.Gruppe && team.Divisjon) {
            const division = iDivisions.find(div => div.name === team.Divisjon);
            const groupExists = division && division.group.some(group => group.name === team.Gruppe);
            if (!groupExists) {
                importMessage.push(`Feil på linje ${lineNumber}: i Lag-arket, gruppe '${team.Gruppe}' finnes ikke i divisjonen '${team.Divisjon}' for laget ${team.Lagnavn}.`);
               
            }
        }

        // Omdøp nøkler til riktig format
        return {
            name: team.Lagnavn || "",
            initials: team.Initialer || "",
            clubname: team.Klubb || "",
            club:clubid || "",
            divisionname: team.Divisjon || "",
            groupname: team.Gruppe || ""
        };
    }).filter(Boolean); // Fjern null-verdier for ugyldige lag
    return validatedTeams;
}

function controllMatch(data1, data2) {
    const validMatchTypes = ["round2","placementfinale","eighthfinale", "quarterfinale", "semifinale","bronzefinale", "finale"];
    const validatedMatches = [];
    
    // Kontroll for Kamper-arket (data1)
    data1.forEach((match, index) => {
        const lineNumber = index + 1; // Linjenummer for Kamper-arket

        // Sjekk at nødvendige felter er fylt ut
        if (!match.Dato || !match.Klokkeslett) {
            importMessage.push(`Feil på linje ${lineNumber}: Kamper-arket, mangler dato eller klokkeslett.`);
           
        }

        if (!match.Lag1 || !match.Lag2) {
            importMessage.push(`Feil på linje ${lineNumber}: Kamper-arket mangler et av lagene (${match.Lag1 || "ukjent"} vs ${match.Lag2 || "ukjent"}).`);
            
        }

        // Sjekk divisjon og gruppe
        if (!iDivisions.some(div => div.name === match.Divisjon)) {
            importMessage.push(`Feil på linje ${lineNumber}: Divisjon "${match.Divisjon}" i Kamper-arket. Må defineres som i divisjonsarket.`);
           
        }

        const division = iDivisions.find(div => div.name === match.Divisjon);
        if (division && match.Gruppe && !division.group.some(group => group.name === match.Gruppe)) {
            importMessage.push(`Feil på linje ${lineNumber}: Gruppe "${match.Gruppe}" i Kamper-arket finnes ikke i divisjonen "${match.Divisjon}".`);
           
        }

        // Sjekk lag i iTeams
        if (!iTeams.some(team => team.name === match.Lag1) || !iTeams.some(team => team.name === match.Lag2)) {
            importMessage.push(`Feil på linje ${lineNumber}: I Kamper-arket. Ett eller begge lagene "${match.Lag1}" og "${match.Lag2}" finnes ikke på Lag-arket.`);
            
        }

        // Omdøp nøkler
        validatedMatches.push({
            time:parseDateSmart(match.Dato, match.Klokkeslett),
            divisionname: match.Divisjon || "",
            groupname: match.Gruppe || "",
            team1name: match.Lag1 || "",
            team2name: match.Lag2 || "",
            fieldname: match.Bane || "",
            location: match.Plassering || "",
            refereename: match.Dommer || ""
          });
          
    });

    // Kontroll for Finalekamper-arket (data2)
    data2.forEach((match, index) => {
        const lineNumber = index + 1; // Linjenummer for Finalekamper-arket

        // Sjekk at nødvendige felter er fylt ut
        if (!match.Dato || !match.Klokkeslett) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket, mangler dato eller klokkeslett.`);
            
        }

        if (!match.Lag1tekst || !match.Lag2tekst) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket mangler et av lagtekstene (${match.Lag1tekst || "ukjent"} vs ${match.Lag2tekst || "ukjent"}).`);
            
        }

        // Sjekk Typekamp, Kampnr og Sluttspill
        if (!validMatchTypes.includes(match.Typekamp)) {
            importMessage.push(`Feil på linje ${lineNumber}: Ugyldig Typekamp "${match.Typekamp}" i Finalekamper-arket. Gyldige verdier: ${validMatchTypes.join(", ")}.`);
            
        }

        if (!match.Kampnr) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket mangler finalenummer (Kampnr).`);
            
        }

        if (!match.Sluttspill) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket mangler Sluttspill.`);
            
        }

        // Sjekk divisjon og gruppe
        if (!iDivisions.some(div => div.name === match.Divisjon)) {
            importMessage.push(`Feil på linje ${lineNumber}: Divisjon "${match.Divisjon}" i Finalekamper-arket. Må defineres som i divisjonsarket.`);
            
        }

        const division = iDivisions.find(div => div.name === match.Divisjon);
        if (division && match.Gruppe && !division.group.some(group => group.name === match.Gruppe)) {
            importMessage.push(`Feil på linje ${lineNumber}: Gruppe "${match.Gruppe}" i Finalekamper-arket finnes ikke i divisjonen "${match.Divisjon}".`);
           
        }

        // Omdøp nøkler
        validatedMatches.push({
            time:parseDateSmart(match.Dato, match.Klokkeslett),
            divisionname: match.Divisjon || "",
            groupname: match.Gruppe || "",
            team1name: match.Lag1 || "",
            team2name: match.Lag2 || "",
            fieldname: match.Bane || "",
            location: match.Plassering || "",
            refereename: match.Dommer || "",
            typematch: match.Typekamp || "",
            endplayplace: match.Kampnr || "",
            endplay: match.Sluttspill || "",
            placeholderteam1: match.Lag1tekst || "",
            placeholderteam2: match.Lag2tekst || ""
        });
    });

    return validatedMatches;
}

function parseDateSmart(dato, klokke) {
    // 1. Håndter dato
    let finalDate;
  
    if (typeof dato === "string" && dato.includes(".")) {
      // DD.MM.YYYY → parse manuelt
      const parts = dato.split(".");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        finalDate = new Date(year, month, day);
      }
    } else if (typeof dato === "string" && dato.includes("-")) {
      // DD-MM-YYYY → parse manuelt
      const parts = dato.split("-");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        finalDate = new Date(year, month, day);
      }
    } else if (typeof dato === "string" && dato.includes("/")) {
      // MM/DD/YYYY → vanlig parsing
      finalDate = new Date(dato);
    }
  
    // Hvis dato er tom eller ugyldig → send alert og returner null
    if (!finalDate || isNaN(finalDate.getTime())) {
      alert("Ugyldig datoformat. Vennligst bruk DD.MM.YYYY, DD-MM-YYYY eller MM/DD/YYYY.");
      return null;
    }
  
    // Formatér dato som "DD/MM/YYYY"
    const day = String(finalDate.getDate()).padStart(2, "0");
    const month = String(finalDate.getMonth() + 1).padStart(2, "0");
    const year = finalDate.getFullYear();
    const dateConverted = `${day}/${month}/${year}`;
  
    // 2. Håndter klokkeslett
    let cleanClock = klokke || "00:00";
    cleanClock = cleanClock.replace(".", ":");
  
    // Hvis klokken er tom etter rensing, sett til 00:00
    if (!/^\d{1,2}:\d{2}$/.test(cleanClock)) {
      cleanClock = "00:00";
    }
  
    // 3. Returner format som ISO-dato (YYYY-MM-DD) + klokke
    const isoDate = `${finalDate.toISOString().split("T")[0]} ${cleanClock}`;
    return isoDate;
  }
  
  
  
  
  







function convertJSONrow(data) {
    try {
        return data.map(item => {
            // Fjern ekstra escape-tegn fra JSON-strengen
            const sanitizedItem = item.replace(/\\\"/g, '"').replace(/\\\\/g, '\\');
            console.log(sanitizedItem);
            // Parse JSON-strengen
            return JSON.parse(sanitizedItem);
        });
    } catch (error) {
        console.error("Feil ved parsing av JSON-rad:", error, item);
        return [];
    }
}


function convertArrayToOptions(array, textKey, valueKey) {
    let options = [];
    for (let item of array) {
        let value = item[valueKey];
        let text = item[textKey];
        options.push({ value: value, text: text });
    }

    // Sorter options alfabetisk etter text
    options.sort((a, b) => a.text.localeCompare(b.text, 'no', { sensitivity: 'base' }));

    return options;
}

function formatIsoDateValue(isoDate){

// Konverter til Date-objekt
const matchDate = new Date(isoDate);

// Formater dato i UTC
const year = matchDate.getUTCFullYear();
const month = String(matchDate.getUTCMonth() + 1).padStart(2, "0"); // Måned er 0-indeksert
const day = String(matchDate.getUTCDate()).padStart(2, "0");
const hours = String(matchDate.getUTCHours()).padStart(2, "0");
const minutes = String(matchDate.getUTCMinutes()).padStart(2, "0");

return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatIsoDateName(isoDate){

    const matchDate = new Date(isoDate);
        const day = String(matchDate.getUTCDate()).padStart(2, "0");
        const month = matchDate.toLocaleString("no-NO", { month: "short", timeZone: "UTC" }).replace('.', '');
        const hours = String(matchDate.getUTCHours()).padStart(2, "0");
        const minutes = String(matchDate.getUTCMinutes()).padStart(2, "0");
        
return `${day}.${month} ${hours}:${minutes}`;
}

function formatDateName(input){
   
    // Konverter til Date-objekt
    const date = new Date(input);
    
    // Hent dag, måned og tid
    const day = String(date.getDate()).padStart(2, "0"); // Henter dag med to sifre
    const months = ["jan.", "feb.", "mars", "apr.", "mai", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "des."];
    const month = months[date.getMonth()]; // Finner riktig måned basert på index
    const hours = String(date.getHours()).padStart(2, "0"); // Henter timer
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Henter minutter
    
    // Bygg ønsket format
    return `${day}.${month} ${hours}:${minutes}`;
}