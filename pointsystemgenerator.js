function generatePointToTeams(data) {
    if (activetournament.sport[0] === "recAEU6UjebhKfFBy") {
        // Fotball
        console.log("Dette er fotballoppsett");
        let tabeldata = generateFotballPointToTeams(data);

        tabeldata.sort((a, b) => {
            if (b.points.points !== a.points.points) {
                return b.points.points - a.points.points; 
            }
            if (b.points.goalDifference !== a.points.goalDifference) {
                return b.points.goalDifference - a.points.goalDifference;
            }
            return b.points.goalsFor - a.points.goalsFor; 
        });

        return tabeldata;

    } else if (activetournament.sport[0] === "recSCesi2BGmCyivZ") {
        // Volleyball
        console.log("Dette er volleyballoppsett");
        let tabeldata = generateVolleyballPointToTeams(data);

        tabeldata.sort((a, b) => {
            if (b.points.points !== a.points.points) {
                return b.points.points - a.points.points;
            }
            if (b.points.setDifference !== a.points.setDifference) {
                return b.points.setDifference - a.points.setDifference;
            }
            return b.points.pointsDifference - a.points.pointsDifference;
        });

        return tabeldata;

    } else if (activetournament.sport[0] === "reca0jxxTQAtlUTNu") {
        // Ishockey
        console.log("Dette er ishockeyoppsett");
        let tabeldata = generateIceHockeyPointToTeams(data);

        tabeldata.sort((a, b) => {
            if (b.points.points !== a.points.points) {
                return b.points.points - a.points.points;
            }
            if (b.points.goalDifference !== a.points.goalDifference) {
                return b.points.goalDifference - a.points.goalDifference;
            }
            return b.points.goalsFor - a.points.goalsFor;
        });

        return tabeldata;

    } else if (activetournament.sport[0] === "recCUabw69dx5ZajH") {
        // Padel
        console.log("Dette er padeloppsett");
        let tabeldata = generatePadelPointToTeams(data);

        tabeldata.sort((a, b) => {
            if (b.points.points !== a.points.points) {
                return b.points.points - a.points.points;
            }
            if (b.points.goalDifference !== a.points.goalDifference) {
                return b.points.goalDifference - a.points.goalDifference;
            }
            return b.points.goalsFor - a.points.goalsFor;
        });

        return tabeldata;

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

function generateVolleyballPointToTeams(data) {
    // Initialiser poengstatistikk for hvert lag
    for (let team of data) {
        team.points = {
            played: 0,
            won: 0,
            lost: 0,
            setsFor: 0, // Total sett vunnet
            setsAgainst: 0, // Total sett tapt
            setDifference: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            pointsDifference: 0,
            points: 0,
            goalSetDifference: 0, // Sett målforskjell for ekstra sortering
            goalsetScores: [] // Liste for settresultater
        };
    }

    // Oppdater poengstatistikk basert på kamper
    for (let match of matches) {
        if (typeof match.goalteam1 === "undefined" || typeof match.goalteam2 === "undefined") {
            continue; // Hopp over kamper som ikke er spilt
        }

        let team1 = data.find(team => team.airtable === match.team1);
        let team2 = data.find(team => team.airtable === match.team2);

        if (team1 && team2) {
            team1.points.played++;
            team2.points.played++;

            const team1Score = match.goalteam1;
            const team2Score = match.goalteam2;

            // Oppdater settstatistikk basert på `goalsetScores`
            if (match.goalsett) {
                // Konverter `goalsett` fra string til objekt hvis nødvendig
                let goalsetData;
                try {
                    goalsetData = typeof match.goalsett === 'string' ? JSON.parse(match.goalsett) : match.goalsett;
                } catch (e) {
                    console.error("Feil ved parsing av goalsett:", e);
                    continue; // Hopp over hvis parsing feiler
                }

                let setsFor = 0;
                let setsAgainst = 0;

                // Legg til settresultater og beregn summen
                team1.points.goalsetScores.push({
                    opponent: team2.name,
                    sets: goalsetData
                });
                team2.points.goalsetScores.push({
                    opponent: team1.name,
                    sets: Object.fromEntries(
                        Object.entries(goalsetData).map(([key, { team1, team2 }]) => [key, { team1: team2, team2: team1 }])
                    )
                });

                Object.values(goalsetData).forEach(set => {
                    setsFor += set.team1;
                    setsAgainst += set.team2;
                });

                team1.points.setsFor += setsFor;
                team1.points.setsAgainst += setsAgainst;
                team2.points.setsFor += setsAgainst;
                team2.points.setsAgainst += setsFor;
            }

            // Oppdater mål for og mot
            team1.points.goalsFor += team1Score;
            team1.points.goalsAgainst += team2Score;
            team2.points.goalsFor += team2Score;
            team2.points.goalsAgainst += team1Score;

            // Oppdater poeng for kampresultater
            if (team1Score > team2Score) {
                team1.points.won++;
                team2.points.lost++;
                team1.points.points += 3; // 3 poeng for seier
            } else if (team1Score < team2Score) {
                team2.points.won++;
                team1.points.lost++;
                team2.points.points += 3; // 3 poeng for seier
            }
        }
    }

    // Beregn settdifferanse etter at alle kamper er oppdatert
    for (let team of data) {
        team.points.setDifference = team.points.setsFor - team.points.setsAgainst;
    }

    return data;
}

function generateIceHockeyPointToTeams(data) {
    // Initialiser poengstatistikk for hvert lag
    for (let team of data) {
        team.points = {
            played: 0,
            won: 0,
            lost: 0,
            otWon: 0, // Vunnet i overtid
            otLost: 0, // Tapt i overtid
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        };
    }

    // Oppdater poengstatistikk basert på kamper
    for (let match of matches) {
        if (typeof match.goalteam1 === "undefined" || typeof match.goalteam2 === "undefined") {
            continue; // Hopp over kamper som ikke er spilt
        }

        let team1 = data.find(team => team.airtable === match.team1[0]);
        let team2 = data.find(team => team.airtable === match.team2[0]);

        if (team1 && team2) {
            // Oppdater spilte kamper
            team1.points.played++;
            team2.points.played++;

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

            // Sjekk om kampen gikk til overtid
            if (match.overtime || match.shootout) {
                if (team1Score > team2Score) {
                    // Team1 vant i overtid
                    team1.points.otWon++;
                    team2.points.otLost++;
                    team1.points.points += 2; // 2 poeng for OT-seier
                    team2.points.points += 1; // 1 poeng for OT-tap
                } else if (team1Score < team2Score) {
                    // Team2 vant i overtid
                    team2.points.otWon++;
                    team1.points.otLost++;
                    team2.points.points += 2; // 2 poeng for OT-seier
                    team1.points.points += 1; // 1 poeng for OT-tap
                }
            } else {
                // Ordinær seier eller tap
                if (team1Score > team2Score) {
                    team1.points.won++;
                    team2.points.lost++;
                    team1.points.points += 3; // 3 poeng for seier i ordinær tid
                } else if (team1Score < team2Score) {
                    team2.points.won++;
                    team1.points.lost++;
                    team2.points.points += 3; // 3 poeng for seier i ordinær tid
                }
            }
        }
    }

    return data;
}

function generatePadelPointToTeams(data) {
    // Initialiser poengstatistikk for hvert lag
    for (let team of data) {
        team.points = {
            played: 0,
            won: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        };
    }

    // Oppdater poengstatistikk basert på kamper
    for (let match of matches) {
        if (typeof match.goalteam1 === "undefined" || typeof match.goalteam2 === "undefined") {
            continue; // Hopp over kamper som ikke er spilt
        }

        let team1 = data.find(team => team.airtable === match.team1[0]);
        let team2 = data.find(team => team.airtable === match.team2[0]);

        if (team1 && team2) {
            // Oppdater spilte kamper
            team1.points.played++;
            team2.points.played++;

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

            // Oppdater poeng for kampresultater
            if (team1Score > team2Score) {
                team1.points.won++;
                team2.points.lost++;
                team1.points.points += 3; // 3 poeng for seier
            } else if (team1Score < team2Score) {
                team2.points.won++;
                team1.points.lost++;
                team2.points.points += 3; // 3 poeng for seier
            }
        }
    }

    return data;
}


