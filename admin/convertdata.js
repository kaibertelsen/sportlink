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
    const validatedTeams = data.map(team => {
        // Valider Lagnavn
        if (!team.Lagnavn || typeof team.Lagnavn !== "string") {
            alert(`Laget mangler Lagnavn eller har en ugyldig verdi: ${JSON.stringify(team)}`);
        }

        // Valider Divisjon
        if (!team.Divisjon || !iDivisions.some(div => div.name === team.Divisjon)) {
            alert(`Ugyldig eller manglende divisjon for laget ${team.Lagnavn}. Divisjon: ${team.Divisjon}`);
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
                    `Klubb '${team.Klubb}' finnes ikke i gClub for laget ${team.Lagnavn}.\n` +
                    `Mulige klubber er:\n${availableClubs}`
                );
            }
        }

        // Valider Gruppe
        if (team.Gruppe && team.Divisjon) {
            const division = iDivisions.find(div => div.name === team.Divisjon);
            const groupExists = division && division.group.some(group => group.name === team.Gruppe);
            if (!groupExists) {
                alert(`Gruppe '${team.Gruppe}' finnes ikke i divisjonen '${team.Divisjon}' for laget ${team.Lagnavn}.`);
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
    });

    console.log(validatedTeams);
    return validatedTeams;
}

function controllMatch(data1, data2) {
    const combinedData = [...data1, ...data2];
    const validMatchTypes = ["eighthfinale", "quarterfinale", "semifinale", "finale"];
    const validatedMatches = [];

    combinedData.forEach((match, index) => {
        const lineNumber = index + 1; // Linjenummer i datasettet

        // Sjekk at nødvendige felter er fylt ut
        if (!match.Dato || !match.Klokkeslett) {
            alert(`Feil på linje ${lineNumber}: Kampen mangler dato eller klokkeslett. Kampdata: ${JSON.stringify(match)}`);
            return;
        }

        if (!match.Lag1 || !match.Lag2) {
            alert(`Feil på linje ${lineNumber}: Kampen mangler et av lagene (${match.Lag1 || "ukjent"} vs ${match.Lag2 || "ukjent"}). Kampdata: ${JSON.stringify(match)}`);
            return;
        }

        // Sjekk at nødvendige felter i data2 er gyldige
        if (match.Typekamp) {
            if (!validMatchTypes.includes(match.Typekamp)) {
                alert(`Feil på linje ${lineNumber}: Ugyldig Typekamp "${match.Typekamp}". Gyldige verdier: ${validMatchTypes.join(", ")}.`);
            }
            if (!match.Kampnr) {
                alert(`Feil på linje ${lineNumber}: Finalekamp mangler finalenummer (Kampnr). Kampdata: ${JSON.stringify(match)}`);
            }
            if (!match.Sluttspill) {
                alert(`Feil på linje ${lineNumber}: Finalekamp mangler Sluttspill. Kampdata: ${JSON.stringify(match)}`);
            }
        }

        // Sjekk divisjon og gruppe
        if (!iDivisions.some(div => div.name === match.Divisjon)) {
            alert(`Feil på linje ${lineNumber}: Divisjon "${match.Divisjon}" er ikke definert i divisjonsarket. Lag: ${match.Lag1} vs ${match.Lag2}, Tidspunkt: ${match.Klokkeslett}`);
            return;
        }

        const division = iDivisions.find(div => div.name === match.Divisjon);
        if (division && match.Gruppe && !division.group.some(group => group.name === match.Gruppe)) {
            alert(`Feil på linje ${lineNumber}: Gruppe "${match.Gruppe}" finnes ikke i divisjonen "${match.Divisjon}". Lag: ${match.Lag1} vs ${match.Lag2}, Tidspunkt: ${match.Klokkeslett}`);
            return;
        }

        // Sjekk lag i iTeams
        if (!iTeams.some(team => team.name === match.Lag1) || !iTeams.some(team => team.name === match.Lag2)) {
            alert(`Feil på linje ${lineNumber}: Ett eller begge lagene "${match.Lag1}" og "${match.Lag2}" finnes ikke på Lag-arket`);
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


