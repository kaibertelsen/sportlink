function convertImportDataTurnament(data) {
    // Konverterer dataene til riktig nøkkelnavn
    const convertedData = data.map(item => ({
        name: item.Turneringsnavn || "",
        organizer: item.Arrangement || "",
        sport: item.Sport || "",
        startdate: item.Start || "",
        enddate: item.Slutt || ""
    }));

    console.log(convertedData);
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

    console.log(formattedData);
    return formattedData;
}

function controllTeam(data) {
    const validatedTeams = data.map((team, index) => {
        const lineNumber = index + 1; // Linjenummer i datasettet

        // Valider Lagnavn
        if (!team.Lagnavn || typeof team.Lagnavn !== "string") {
            alert(`Feil på linje ${lineNumber}: i Lag-arket, laget mangler Lagnavn eller har en ugyldig verdi. Kampdata: ${JSON.stringify(team)}`);
            return null; // Hopp over ugyldig lag
        }

        // Valider Divisjon
        if (!team.Divisjon || !iDivisions.some(div => div.name === team.Divisjon)) {
            alert(`Feil på linje ${lineNumber}:i Lag-arket, ugyldig eller manglende divisjon for laget ${team.Lagnavn}. Divisjon: ${team.Divisjon}`);
            return null; // Hopp over ugyldig lag
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

                alert(
                    `Feil på linje ${lineNumber}: i Lag-arket, klubb '${team.Klubb}' finnes ikke i systemet for laget ${team.Lagnavn}.\n` +
                    `Mulige klubber som ligger inne i systemet nå er:\n${availableClubs}`
                );
                return null; // Hopp over ugyldig lag
            }
        }

        // Valider Gruppe
        if (team.Gruppe && team.Divisjon) {
            const division = iDivisions.find(div => div.name === team.Divisjon);
            const groupExists = division && division.group.some(group => group.name === team.Gruppe);
            if (!groupExists) {
                alert(`Feil på linje ${lineNumber}: i Lag-arket, gruppe '${team.Gruppe}' finnes ikke i divisjonen '${team.Divisjon}' for laget ${team.Lagnavn}.`);
                return null; // Hopp over ugyldig lag
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

    console.log(validatedTeams);
    return validatedTeams;
}


function controllMatch(data1, data2) {
    const validMatchTypes = ["eighthfinale", "quarterfinale", "semifinale", "finale"];
    const validatedMatches = [];

    let lineNumberData1 = 0; // Teller for Kamper-arket
    let lineNumberData2 = 0; // Teller for Finalekamper-arket

    const combinedData = [...data1, ...data2];

    combinedData.forEach((match) => {
        const isFinalMatch = data2.includes(match); // Sjekk om kampen kommer fra Finalekamper-arket
        const lineNumber = isFinalMatch ? ++lineNumberData2 : ++lineNumberData1; // Inkrementer riktig teller

        // Sjekk at nødvendige felter er fylt ut
        if (!match.Dato || !match.Klokkeslett) {
            alert(`Feil på linje ${lineNumber}: ${isFinalMatch ? "Finalekamper-arket" : "Kamper-arket"}, mangler dato eller klokkeslett.`);
            return;
        }

        if (!match.Lag1 || !match.Lag2) {
            alert(`Feil på linje ${lineNumber}: ${isFinalMatch ? "Finalekamper-arket" : "Kamper-arket"} mangler et av lagene (${match.Lag1 || "ukjent"} vs ${match.Lag2 || "ukjent"}).`);
            return;
        }

        // Sjekk at nødvendige felter i data2 er gyldige
        if (isFinalMatch && match.Typekamp) {
            if (!validMatchTypes.includes(match.Typekamp)) {
                alert(`Feil på linje ${lineNumber}: Ugyldig Typekamp "${match.Typekamp}" i Finalekamper-arket. Gyldige verdier: ${validMatchTypes.join(", ")}.`);
            }
            if (!match.Kampnr) {
                alert(`Feil på linje ${lineNumber}: Finalekamp mangler finalenummer (Kampnr).`);
            }
            if (!match.Sluttspill) {
                alert(`Feil på linje ${lineNumber}: Finalekamp mangler Sluttspill.`);
            }
        }

        // Sjekk divisjon og gruppe
        if (!iDivisions.some(div => div.name === match.Divisjon)) {
            alert(`Feil på linje ${lineNumber}: Divisjon "${match.Divisjon}" i ${isFinalMatch ? "Finalekamper-arket" : "Kamper-arket"}. Må defineres som i divisjonsarket.`);
            return;
        }

        const division = iDivisions.find(div => div.name === match.Divisjon);
        if (division && match.Gruppe && !division.group.some(group => group.name === match.Gruppe)) {
            alert(`Feil på linje ${lineNumber}: Gruppe "${match.Gruppe}" i ${isFinalMatch ? "Finalekamper-arket" : "Kamper-arket"}, finnes ikke i divisjonen "${match.Divisjon}".`);
            return;
        }

        // Sjekk lag i iTeams
        if (!iTeams.some(team => team.name === match.Lag1) || !iTeams.some(team => team.name === match.Lag2)) {
            alert(`Feil på linje ${lineNumber}: I ${isFinalMatch ? "Finalekamper-arket" : "Kamper-arket"}. Ett eller begge lagene "${match.Lag1}" og "${match.Lag2}" finnes ikke på Lag-arket.`);
            return;
        }

        // Omdøp nøkler
        const validatedMatch = {
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
            endplay: match.Sluttspill || ""
        };

        validatedMatches.push(validatedMatch);
    });

    console.log(validatedMatches);
    return validatedMatches;
}




