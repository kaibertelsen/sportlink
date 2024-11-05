function generatePointToTeams(data) {
    if (activetournament.sport[0] === "recAEU6UjebhKfFBy") {
        // Fotball
        console.log("Dette er fotballoppsett");
        let tabeldata = generateFotballPointToTeams(data);

        // Sorter tabeldata
        tabeldata.sort((a, b) => {
            if (b.points !== a.points) {
                return b.points - a.points; // Sorter først etter poeng (høyeste først)
            }
            if (b.goalDifference !== a.goalDifference) {
                return b.goalDifference - a.goalDifference; // Deretter etter målforskjell
            }
            return b.goalsFor - a.goalsFor; // Til slutt etter antall mål scoret
        });

        console.log("Sortert tabelldata:", tabeldata);
    } else {
        console.log("Dette er et oppsett som ikke er definert enda");
    }
}


function generateFotballPointToTeams(data) {
    // Initialiser poengstatistikk for hvert lag
    for (let team of data) {
        team.points = {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        };
    }

    // Oppdater poengstatistikk basert på kamper
    for (let match of matches) {
        // Sjekk om kampen har blitt spilt
        if (typeof match.goalteam1 === "undefined" || typeof match.goalteam2 === "undefined") {
            continue; // Hopp over kamper som ikke er spilt
        }

        let team1 = data.find(team => team.airtable === match.team1[0]);
        let team2 = data.find(team => team.airtable === match.team2[0]);

        if (team1 && team2) {
            // Oppdater spilte kamper
            team1.points.played++;
            team2.points.played++;

            // Bruk faktiske mål fra `goalteam1` og `goalteam2`
            const team1Score = match.goalteam1;
            const team2Score = match.goalteam2;

            // Oppdater mål for og mot
            team1.points.goalsFor += team1Score;
            team1.points.goalsAgainst += team2Score;
            team2.points.goalsFor += team2Score;
            team2.points.goalsAgainst += team1Score;

            // Oppdater målforskjell
            team1.points.goalDifference = team1.points.goalsFor - team1.points.goalsAgainst;
            team2.points.goalDifference = team2.points.goalsFor - team2.points.goalsAgainst;

            // Oppdater seire, uavgjort, tap og poeng
            if (team1Score > team2Score) {
                team1.points.won++;
                team2.points.lost++;
                team1.points.points += 3; // 3 poeng for seier
            } else if (team1Score < team2Score) {
                team2.points.won++;
                team1.points.lost++;
                team2.points.points += 3;
            } else {
                team1.points.drawn++;
                team2.points.drawn++;
                team1.points.points += 1; // 1 poeng for uavgjort
                team2.points.points += 1;
            }
        }
    }

    return data;
}
