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
        if (typeof team !== "object" || team === null) {
            console.error("Invalid team object:", team);
            continue;
        }
        team.points = {
            played: 0,
            won: 0,
            lost: 0,
            setsFor: 0,
            setsAgainst: 0,
            setDifference: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointsDifference: 0,
            points: 0,
            goalSetDifference: 0, // Sett målforskjell for ekstra sortering
            goalsetScores: [] // Liste for settresultater
        };
    }

    // Oppdater poengstatistikk basert på kamper
    for (let match of matches) {
        if (typeof match.setsTeam1 === "undefined" || typeof match.setsTeam2 === "undefined") {
            continue; // Hopp over kamper som ikke er spilt
        }

        let team1 = data.find(team => team.airtable === match.team1[0]);
        let team2 = data.find(team => team.airtable === match.team2[0]);

        if (team1 && team2) {
            team1.points.played++;
            team2.points.played++;

            const setsTeam1 = match.setsTeam1;
            const setsTeam2 = match.setsTeam2;

            team1.points.setsFor += setsTeam1;
            team1.points.setsAgainst += setsTeam2;
            team2.points.setsFor += setsTeam2;
            team2.points.setsAgainst += setsTeam1;

            team1.points.setDifference = team1.points.setsFor - team1.points.setsAgainst;
            team2.points.setDifference = team2.points.setsFor - team2.points.setsAgainst;

            // Bruk `goalsett` for å beregne sett målforskjell og lagre sett-resultater
            if (match.goalsett) {
                // Konverter `goalsett` fra string til objekt
                let goalsetData;
                try {
                    goalsetData = JSON.parse(match.goalsett);
                } catch (e) {
                    console.error("Feil ved parsing av goalsett:", e);
                    continue; // Hopp over hvis parsing feiler
                }

                let goalSetDifference1 = 0;
                let goalSetDifference2 = 0;
                
                // Legg til informasjon fra `goalsett` til begge lags `goalsetScores`
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
                    goalSetDifference1 += set.team1 - set.team2;
                    goalSetDifference2 += set.team2 - set.team1;
                });

                team1.points.goalSetDifference += goalSetDifference1;
                team2.points.goalSetDifference += goalSetDifference2;

                // Oppdater poeng for og mot (hvis tilgjengelig)
                if (typeof match.pointsTeam1 !== "undefined" && typeof match.pointsTeam2 !== "undefined") {
                    const pointsTeam1 = match.pointsTeam1;
                    const pointsTeam2 = match.pointsTeam2;

                    team1.points.pointsFor += pointsTeam1;
                    team1.points.pointsAgainst += pointsTeam2;
                    team2.points.pointsFor += pointsTeam2;
                    team2.points.pointsAgainst += pointsTeam1;

                    team1.points.pointsDifference = team1.points.pointsFor - team1.points.pointsAgainst;
                    team2.points.pointsDifference = team2.points.pointsFor - team2.points.pointsAgainst;
                }
            }

            // Oppdater seire, tap og poeng
            if (setsTeam1 > setsTeam2) {
                team1.points.won++;
                team2.points.lost++;

                if (setsTeam1 === 3 && setsTeam2 <= 1) {
                    team1.points.points += 3; 
                } else if (setsTeam1 === 3 && setsTeam2 === 2) {
                    team1.points.points += 2;
                    team2.points.points += 1;
                }
            } else if (setsTeam1 < setsTeam2) {
                team2.points.won++;
                team1.points.lost++;

                if (setsTeam2 === 3 && setsTeam1 <= 1) {
                    team2.points.points += 3;
                } else if (setsTeam2 === 3 && setsTeam1 === 2) {
                    team2.points.points += 2;
                    team1.points.points += 1;
                }
            }
        }
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
            otWon: 0, // Overtid/straffer vunnet
            otLost: 0, // Overtid/straffer tapt
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

            // Sjekk om kampen gikk til overtid eller straffer
            if (match.overtime || match.shootout) {
                if (team1Score > team2Score) {
                    // Team1 vant i overtid eller på straffer
                    team1.points.otWon++;
                    team2.points.otLost++;
                    team1.points.points += 2; // 2 poeng for seier i overtid/straffer
                    team2.points.points += 1; // 1 poeng for tap i overtid/straffer
                } else if (team1Score < team2Score) {
                    // Team2 vant i overtid eller på straffer
                    team2.points.otWon++;
                    team1.points.otLost++;
                    team2.points.points += 2; // 2 poeng for seier i overtid/straffer
                    team1.points.points += 1; // 1 poeng for tap i overtid/straffer
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

            // Oppdater poeng basert på resultat
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

