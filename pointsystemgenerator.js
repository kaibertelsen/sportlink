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

        let team1 = data.find(team => team.airtable === match.team1);
        let team2 = data.find(team => team.airtable === match.team2);

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
            setsFor: 0, // Total sett-poeng vunnet
            setsAgainst: 0, // Total sett-poeng tapt
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

            // Sjekk om settscore er tilgjengelig
            const setKeys = ["sett1", "sett2", "sett3"];
            let team1SetsWon = 0;
            let team2SetsWon = 0;
            let setsAvailable = setKeys.some(setKey => match[setKey]); // Sjekk om noen settdata finnes

            if (setsAvailable) {
                // Beregn poeng basert på settscore
                for (let setKey of setKeys) {
                    if (match[setKey]) {
                        const [team1SetScore, team2SetScore] = match[setKey].split("-").map(Number);

                        // Summer sett-poeng til `setsFor` og `setsAgainst`
                        team1.points.setsFor += team1SetScore;
                        team1.points.setsAgainst += team2SetScore;
                        team2.points.setsFor += team2SetScore;
                        team2.points.setsAgainst += team1SetScore;

                        // Oppdater settresultater
                        team1.points.goalsetScores.push({ setKey, team1SetScore, team2SetScore });
                        team2.points.goalsetScores.push({ setKey, team2SetScore, team1SetScore });

                        // Beregn antall sett vunnet
                        if (team1SetScore > team2SetScore) {
                            team1SetsWon++;
                        } else if (team2SetScore > team1SetScore) {
                            team2SetsWon++;
                        }
                    }
                }

                // Tildel kamp-poeng basert på antall sett vunnet
                if (team1SetsWon > team2SetsWon) {
                    team1.points.won++;
                    team2.points.lost++;
                    team1.points.points += 3; // 3 poeng for seier basert på sett
                } else if (team2SetsWon > team1SetsWon) {
                    team2.points.won++;
                    team1.points.lost++;
                    team2.points.points += 3; // 3 poeng for seier basert på sett
                } else {
                    // Uavgjort tilfelle hvis aktuelt, eller tilpass om det ikke er aktuelt for volleyball
                    team1.points.points += 1; // 1 poeng for uavgjort
                    team2.points.points += 1;
                }
            } else {
                // Beregn poeng basert på målpoeng når settdata ikke er tilgjengelig
                team1.points.goalsFor += team1Score;
                team1.points.goalsAgainst += team2Score;
                team2.points.goalsFor += team2Score;
                team2.points.goalsAgainst += team1Score;

                if (team1Score > team2Score) {
                    team1.points.won++;
                    team2.points.lost++;
                    team1.points.points += 3; // 3 poeng for seier
                } else if (team1Score < team2Score) {
                    team2.points.won++;
                    team1.points.lost++;
                    team2.points.points += 3; // 3 poeng for seier
                } else {
                    // Hvis uavgjort, tildel 1 poeng til hvert lag
                    team1.points.points += 1;
                    team2.points.points += 1;
                }
            }
        }
    }

    // Beregn settdifferanse etter at alle kamper er oppdatert
    for (let team of data) {
        team.points.setDifference = team.points.setsFor - team.points.setsAgainst;
        team.points.pointsDifference = team.points.goalsFor - team.points.goalsAgainst;
    }

    return data;
}

function generateIceHockeyPointsToTeams(data) {
    // Initialiser poengstatistikk for hvert lag
    for (let team of data) {
        team.points = {
            played: 0,
            won: 0,
            overtimeWins: 0,
            overtimeLosses: 0,
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

        let team1 = data.find(team => team.airtable === match.team1);
        let team2 = data.find(team => team.airtable === match.team2);

        if (team1 && team2) {
            // Oppdater spilte kamper
            team1.points.played++;
            team2.points.played++;

            // Hent mål fra `goalteam1` og `goalteam2`
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

            // Sjekk om kampen gikk til overtid eller straffeslag
            const isOvertime = match.overtime || false;
            const isShootout = match.shootout || false;

            // Oppdater poeng basert på resultat
            if (team1Score > team2Score) {
                if (isOvertime || isShootout) {
                    // Team 1 vinner i overtid/straffeslag
                    team1.points.overtimeWins++;
                    team2.points.overtimeLosses++;
                    team1.points.points += 2; // 2 poeng for seier i overtid/straffeslag
                    team2.points.points += 1; // 1 poeng for tap i overtid/straffeslag
                } else {
                    // Team 1 vinner i ordinær tid
                    team1.points.won++;
                    team1.points.points += 3; // 3 poeng for seier i ordinær tid
                    team2.points.lost++;
                }
            } else if (team1Score < team2Score) {
                if (isOvertime || isShootout) {
                    // Team 2 vinner i overtid/straffeslag
                    team2.points.overtimeWins++;
                    team1.points.overtimeLosses++;
                    team2.points.points += 2; // 2 poeng for seier i overtid/straffeslag
                    team1.points.points += 1; // 1 poeng for tap i overtid/straffeslag
                } else {
                    // Team 2 vinner i ordinær tid
                    team2.points.won++;
                    team2.points.points += 3; // 3 poeng for seier i ordinær tid
                    team1.points.lost++;
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


