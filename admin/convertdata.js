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
            const clubExists = iClub.some(club => club.name.toLowerCase() === team.Klubb.toLowerCase());
            if (!clubExists) {
                alert(`Klubb '${team.Klubb}' finnes ikke i iClub for laget ${team.Lagnavn}.`);
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


function controllMatch(data1,data2){
    console.log(data1,data2);
}