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
            alert(
                `Det finnes ingen sporter i systemet med navnet "${turnament.sportname}".\n` +
                `Tilgjengelige sporter er:\n${availableSports}`
            );
            return false;
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
            turnament.organizer = organizerMatch.airtable;
            turnament.organizername = organizerMatch.name;

        } else {
            // Hent alle navn fra gSport og formater dem med linjeskift
            const availableOrganizer = gOrganizer.map(organizer => organizer.name).join("\n");

            // Vis en advarsel med tilgjengelige sportsnavn
            alert(
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
        // Formater grupper som et array av objekter
        const groups = division.Grupper.split(",").map(groupName => ({ name: groupName }));

        // Formater sluttspill som et array av objekter med navn og antall finaler
        const endplayNames = division.Sluttspill.split(",");
        const finalCounts = division["Sluttspill-finaler"].split(",").map(Number);
        const endplay = endplayNames.map((endplayName, index) => ({
            endplayname: endplayName,
            finalecount: finalCounts[index] || 0
        }));

        // Returner det formaterte objektet
        return {
            name: division.Divisjon,
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
            importok = false;
        }

        // Valider Divisjon
        if (!team.Divisjon || !iDivisions.some(div => div.name === team.Divisjon)) {
            let message = `Feil på linje ${lineNumber}:i Lag-arket, ugyldig eller manglende divisjon for laget ${team.Lagnavn}. Divisjon: ${team.Divisjon}`
            importMessage.push(message);
            importok = false;

        }

        // Valider Klubb
        if (team.Klubb) {
            const clubExists = gClub.some(club => club.name.toLowerCase() === team.Klubb.toLowerCase());
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
                importok = false;
            }
        }

        // Valider Gruppe
        if (team.Gruppe && team.Divisjon) {
            const division = iDivisions.find(div => div.name === team.Divisjon);
            const groupExists = division && division.group.some(group => group.name === team.Gruppe);
            if (!groupExists) {
                importMessage.push(`Feil på linje ${lineNumber}: i Lag-arket, gruppe '${team.Gruppe}' finnes ikke i divisjonen '${team.Divisjon}' for laget ${team.Lagnavn}.`);
                importok = false;
            }
        }

        // Omdøp nøkler til riktig format
        return {
            name: team.Lagnavn || "",
            initials: team.Initialer || "",
            club: team.Klubb || "",
            divisionname: team.Divisjon || "",
            groupname: team.Gruppe || ""
        };
    }).filter(Boolean); // Fjern null-verdier for ugyldige lag
    return validatedTeams;
}

function controllMatch(data1, data2) {
    const validMatchTypes = ["eighthfinale", "quarterfinale", "semifinale", "finale"];
    const validatedMatches = [];
    
    // Kontroll for Kamper-arket (data1)
    data1.forEach((match, index) => {
        const lineNumber = index + 1; // Linjenummer for Kamper-arket

        // Sjekk at nødvendige felter er fylt ut
        if (!match.Dato || !match.Klokkeslett) {
            importMessage.push(`Feil på linje ${lineNumber}: Kamper-arket, mangler dato eller klokkeslett.`);
            importok = false;
        }

        if (!match.Lag1 || !match.Lag2) {
            importMessage.push(`Feil på linje ${lineNumber}: Kamper-arket mangler et av lagene (${match.Lag1 || "ukjent"} vs ${match.Lag2 || "ukjent"}).`);
            importok = false;
        }

        // Sjekk divisjon og gruppe
        if (!iDivisions.some(div => div.name === match.Divisjon)) {
            importMessage.push(`Feil på linje ${lineNumber}: Divisjon "${match.Divisjon}" i Kamper-arket. Må defineres som i divisjonsarket.`);
            importok = false;
        }

        const division = iDivisions.find(div => div.name === match.Divisjon);
        if (division && match.Gruppe && !division.group.some(group => group.name === match.Gruppe)) {
            importMessage.push(`Feil på linje ${lineNumber}: Gruppe "${match.Gruppe}" i Kamper-arket finnes ikke i divisjonen "${match.Divisjon}".`);
            importok = false;
        }

        // Sjekk lag i iTeams
        if (!iTeams.some(team => team.name === match.Lag1) || !iTeams.some(team => team.name === match.Lag2)) {
            importMessage.push(`Feil på linje ${lineNumber}: I Kamper-arket. Ett eller begge lagene "${match.Lag1}" og "${match.Lag2}" finnes ikke på Lag-arket.`);
            importok = false;
        }

        // Omdøp nøkler
        validatedMatches.push({
            time: `${new Date(match.Dato).toISOString().split("T")[0]} ${match.Klokkeslett}`,
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
            importok = false;
        }

        if (!match.Lag1tekst || !match.Lag2tekst) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket mangler et av lagtekstene (${match.Lag1tekst || "ukjent"} vs ${match.Lag2tekst || "ukjent"}).`);
            importok = false;
        }

        // Sjekk Typekamp, Kampnr og Sluttspill
        if (!validMatchTypes.includes(match.Typekamp)) {
            importMessage.push(`Feil på linje ${lineNumber}: Ugyldig Typekamp "${match.Typekamp}" i Finalekamper-arket. Gyldige verdier: ${validMatchTypes.join(", ")}.`);
            importok = false;
        }

        if (!match.Kampnr) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket mangler finalenummer (Kampnr).`);
            importok = false;
        }

        if (!match.Sluttspill) {
            importMessage.push(`Feil på linje ${lineNumber}: Finalekamper-arket mangler Sluttspill.`);
            importok = false;
        }

        // Sjekk divisjon og gruppe
        if (!iDivisions.some(div => div.name === match.Divisjon)) {
            importMessage.push(`Feil på linje ${lineNumber}: Divisjon "${match.Divisjon}" i Finalekamper-arket. Må defineres som i divisjonsarket.`);
            importok = false;
        }

        const division = iDivisions.find(div => div.name === match.Divisjon);
        if (division && match.Gruppe && !division.group.some(group => group.name === match.Gruppe)) {
            importMessage.push(`Feil på linje ${lineNumber}: Gruppe "${match.Gruppe}" i Finalekamper-arket finnes ikke i divisjonen "${match.Divisjon}".`);
            importok = false;
        }

        // Omdøp nøkler
        validatedMatches.push({
            time: `${new Date(match.Dato).toISOString().split("T")[0]} ${match.Klokkeslett}`,
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







