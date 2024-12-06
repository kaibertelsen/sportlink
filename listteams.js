function getTeams(){
    var body = airtablebodylistAND({tournamentid:activetournament.airtable,archived:0});
    Getlistairtable(baseId,"tbl3ta1WZBr6wKPSp",body,"getTeamresponse");
}

function getTeamresponse(data){
    teams = rawdatacleaner(data);
    listteams(teams);
}

function listteams(data) {
    const activeDivision = getActiveDivisionFilter();

    // Filtrer lagene basert på aktivt divisjonsfilter
    let filteredTeams = activeDivision === "" ? data : data.filter(team => team.division === activeDivision);

    // Generer og sorter teamslist basert på poeng, målforskjell og mål scoret
    let teamslist = generatePointToTeams(filteredTeams);

    // Gruppér lagene etter divisjon og gruppe
    const teamsByDivisionAndGroup = teamslist.reduce((acc, team) => {
        const division = team.divisionname || "Ukjent divisjon"; // Standardnavn hvis divisjon mangler
        const group = team.groupname ? team.groupname : null; // Null hvis gruppe mangler

        if (!acc[division]) {
            acc[division] = {};
        }
        if (!acc[division][group || "Uten gruppe"]) {
            acc[division][group || "Uten gruppe"] = [];
        }
        acc[division][group || "Uten gruppe"].push(team);
        return acc;
    }, {});

    const list = document.getElementById("teamslistholder");
    list.replaceChildren(); // Tømmer holderen for å unngå duplisering

    const elementlibrary = document.getElementById("elementlibrary");

    // Bestem hvilket element som skal kopieres basert på sportstypen
    const sportId = activetournament.sport[0];
    let nodeelement = getPointElement();
    
    // Loop gjennom hver divisjon og gruppe, og opprett en `tablegroupholder` for hver
    for (const [divisionName, groups] of Object.entries(teamsByDivisionAndGroup)) {
        for (const [groupName, groupTeams] of Object.entries(groups)) {
            const copyelement = nodeelement.cloneNode(true);
            
            // Sett divisjons- og gruppenavn, kun divisjonsnavn om gruppe mangler
            const nameelement = copyelement.querySelector(".groupheadername");
            nameelement.textContent = groupName === "Uten gruppe" ? divisionName : `${divisionName} - ${groupName}`;

            const contentholder = copyelement.querySelector(".rowholder");
            const nodeteamhholder = contentholder.querySelector('.resultrow');

            // Sorter lagene i gruppen basert på poeng, målforskjell og mål scoret
            groupTeams.sort((a, b) => {
                if (b.points.points !== a.points.points) {
                    return b.points.points - a.points.points;
                }
                if (b.points.goalDifference !== a.points.goalDifference) {
                    return b.points.goalDifference - a.points.goalDifference;
                }
                return b.points.goalsFor - a.points.goalsFor;
            });

            let range = 1;
            for (let team of groupTeams) {
                const rowelement = nodeteamhholder.cloneNode(true);
                contentholder.appendChild(rowelement);

                // Legg til klikkhendelse på rowelement
                rowelement.addEventListener('click', () => {
                previouspage="";
                viewteam(team);
                });
                loadPointsToviewer(rowelement,team,range);
                range++;
            }
            

            // Fjern mal-elementet etter å ha lagt til alle rader
            nodeteamhholder.remove();
            list.appendChild(copyelement);
        }
    }
}
function getPointElement(){
    // Bestem hvilket element som skal kopieres basert på sportstypen
    const elementlibrary = document.getElementById("elementlibrary");

    const sportId = activetournament.sport[0];
    let nodeelement;
    if (sportId === "recSCesi2BGmCyivZ") {
        // Volleyball ID
        nodeelement = elementlibrary.querySelector('.volleyballview');
    } else if (sportId === "reca0jxxTQAtlUTNu") {
        // Ishockey ID
        nodeelement = elementlibrary.querySelector('.icehockey');
    } else {
        // Standard (Fotball)
        nodeelement = elementlibrary.querySelector('.fotballview');
    }

    return nodeelement
}
function loadPointsToviewer(rowelement,team,range){
    const sportId = activetournament.sport[0];

   // Rangering
   const rangenr = rowelement.querySelector(".rangenr");
   rangenr.textContent = range;

   // Laglogo
   const logoteam = rowelement.querySelector(".clublogo");
   logoteam.removeAttribute('srcset');
   logoteam.src = team.clublogo;

   // Lagnavn
   const teamname = rowelement.querySelector(".teamnamelable");
   teamname.textContent = team.name;

   // Poengstatistikk
   rowelement.querySelector(".played").textContent = team.points.played;
   rowelement.querySelector(".won").textContent = team.points.won;
   rowelement.querySelector(".lost").textContent = team.points.lost;
   
   if (sportId === "recSCesi2BGmCyivZ") {
       // Sett-statistikk for volleyball
       rowelement.querySelector(".setsdifference").textContent = `${team.points.setsFor}-${team.points.setsAgainst}`;
       rowelement.querySelector(".points").textContent = team.points.points;
   } else if (sportId === "reca0jxxTQAtlUTNu") {
       // Målstatistikk for icehocey
       rowelement.querySelector(".ov").textContent = team.points.overtimeWins;
       rowelement.querySelector(".ot").textContent = team.points.overtimeLosses;
       rowelement.querySelector(".goalsfa").textContent = `${team.points.goalsFor}-${team.points.goalsAgainst}`;
       rowelement.querySelector(".goaldifference").textContent = team.points.goalDifference;
       rowelement.querySelector(".points").textContent = team.points.points;
   }else{
        // standard Målstatistikk for fotball
        rowelement.querySelector(".drawn").textContent = team.points.drawn;
        rowelement.querySelector(".goalsfa").textContent = `${team.points.goalsFor}-${team.points.goalsAgainst}`;
        rowelement.querySelector(".goaldifference").textContent = team.points.goalDifference;
        rowelement.querySelector(".points").textContent = team.points.points;
   }
}





function viewteam(team) {
    console.log(team);

    // Oppdater header-informasjon
    const teamheader = document.getElementById("headerwrapperteam");
    teamheader.querySelector(".teamnameheader").textContent = team.name || "Ukjent lag";
    const teamLogo = teamheader.querySelector(".logoteam");
    if (team.clublogo) teamLogo.src = team.clublogo;

    const thismatchinfo = document.getElementById("thisteamhinfo");
    thismatchinfo.querySelector(".clublable").textContent = team.clubname || "Ukjent klubb";

    const clublogo = thismatchinfo.querySelector(".clublogo");
    if (team.clublogo) clublogo.src = team.clublogo;
    thismatchinfo.querySelector(".divisjon").textContent = team.divisionname || "Ukjent divisjon";

    //vise ranking til laget
        let description = team.name+" er plasert slik i "+activetournament.name+":";
        thismatchinfo.querySelector(".rankdescription").textContent = description;
        
        // Bestem hvilket element som skal kopieres basert på sportstypen
        const elementlibrary = document.getElementById("elementlibrary");
        let nodeelement = getPointElement();
        const rankview = thismatchinfo.querySelector(".rankview");
        const copyelement = nodeelement.cloneNode(true);
        rankview.appendChild(copyelement);  
        let teaminfo = findRankForTeam(team);
        //laste inn verdiene
        loadPointsToviewer(rankview,teaminfo.team,teaminfo.range);


    thismatchinfo.querySelector(".matchinactiveturnament").textContent = "kamper i "+activetournament.name;
    
////kampoversikten
    // Filtrer kampene for laget
    const filteredMatches = matches.filter(
        match => match.team1 === team.airtable || match.team2 === team.airtable
    );

    console.log("Filtered Matches:", filteredMatches);

    // Hent mal-elementet for kampvisning
    const nodematchholder = elementlibrary.querySelector(".teampagematch");
    if (!nodematchholder) {
        console.warn("Mal-elementet for kampvisning (.teampagematch) finnes ikke.");
        return;
    }

    // Hent containeren der kampene skal vises
    const teammatchlist = document.getElementById("teammatchlist");
    if (!teammatchlist) {
        console.warn("Containeren for visning av kamper (teampagecontent) finnes ikke.");
        return;
    }
    
    // Tøm eksisterende innhold i containeren
    teammatchlist.innerHTML = "";

    // Gå gjennom filtrerte kamper og legg til elementer
    for (let i = 0; i < filteredMatches.length; i++) {
        const match = filteredMatches[i];
        const matchelement = nodematchholder.cloneNode(true);
        teammatchlist.appendChild(matchelement);
    
        // Hvis dette er den siste match
        if (i === filteredMatches.length - 1) {
            matchelement.querySelector(".bordholder").style.borderBottom = 'none';
        }

        // Klikkhåndtering for kampvisning
        matchelement.onclick = function () {
            //må sette denne siden som historikken for tilbakeknappen inne på matchsiden
            previouspage="team";
            viewMatch(match);
        };

        // Sett dato og klokkeslett i elementet
        matchelement.querySelector(".teamdatematch").textContent = formatdatetoDateAndTimeshort(match.time);

        // Oppdater lagnavn
        const team1Name = match.team1name || match.placeholderteam1 || "Ukjent";
        const team2Name = match.team2name || match.placeholderteam2 || "Ukjent";
        matchelement.querySelector(".team1").textContent = team1Name;
        matchelement.querySelector(".team2").textContent = team2Name;

        // Oppdater logoer
        const team1Logo = matchelement.querySelector(".logoteam1");
        const team2Logo = matchelement.querySelector(".logoteam2");
        if (match.team1clublogo) team1Logo.src = match.team1clublogo;
        if (match.team2clublogo) team2Logo.src = match.team2clublogo;

        // Oppdater sluttspillinformasjon
        const endplayLable = matchelement.querySelector(".endplaylable");
        if (match.typematch) {
            const matchTypeMap = {
                "eighthfinale": "ÅF",
                "quarterfinale": "KF",
                "semifinale": "SF",
                "finale": "F"
            };

            const endplayText = matchTypeMap[match.typematch] || "Ukjent sluttspill";
            endplayLable.textContent = `${endplayText} - ${match.endplay || ""}`;
            endplayLable.style.display = "block";
        } else {
            endplayLable.style.display = "none";
        }

        // Oppdater resultater
        const resultlable = matchelement.querySelector(".resultlable");
        if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
            resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
            resultlable.style.fontWeight = "bold";

            if (match.goalteam1 > match.goalteam2 && match.team1 === team.airtable) {
                resultlable.style.backgroundColor = "green";
            } else if (match.goalteam2 > match.goalteam1 && match.team2 === team.airtable) {
                resultlable.style.backgroundColor = "green";
            } else {
                resultlable.style.backgroundColor = "red";
            }
        } else {
            resultlable.textContent = "Ikke spilt";
            resultlable.style.fontWeight = "normal";
            resultlable.style.backgroundColor = "transparent";
        }
    }

    // Vis lagsiden
    document.getElementById("thisteamtabbutton").click();
}


function findRankForTeam(team) {
    // Filtrer lagene basert på aktivt divisjonsfilter
    let filteredTeams = teams.filter(t => t.division === team.division);

    // Generer og sorter teamslist basert på poeng, målforskjell og mål scoret
    let teamslist = generatePointToTeams(filteredTeams);

    // Gruppér lagene etter divisjon og gruppe
    const teamsByDivisionAndGroup = teamslist.reduce((acc, t) => {
        const division = t.divisionname || "Ukjent divisjon"; // Standardnavn hvis divisjon mangler
        const group = t.groupname || false; // Hvis gruppe mangler, settes den til `false`

        if (!acc[division]) {
            acc[division] = {};
        }
        if (!acc[division][group]) {
            acc[division][group] = [];
        }
        acc[division][group].push(t);
        return acc;
    }, {});

    // Finn laget i listen og dets rangering
    let rank = null;
    let group = null;
    let division = null;

    Object.entries(teamsByDivisionAndGroup).forEach(([divisionName, groups]) => {
        Object.entries(groups).forEach(([groupName, teams]) => {
            // Sorter lagene i gruppen basert på poeng, målforskjell og mål scoret
            teams.sort((a, b) => {
                if (b.points.points !== a.points.points) {
                    return b.points.points - a.points.points;
                }
                if (b.points.pointsDifference !== a.points.pointsDifference) {
                    return b.points.pointsDifference - a.points.pointsDifference;
                }
                return b.points.goalsFor - a.points.goalsFor;
            });

            // Sjekk om laget finnes i denne gruppen
            const teamIndex = teams.findIndex(t => t.airtable === team.airtable);
            if (teamIndex !== -1) {
                rank = teamIndex + 1; // Rangeringen er indeksen + 1
                group = groupName === "false" ? false : groupName; // Sett gruppe til `false` hvis det ikke er en gyldig gruppe
                division = divisionName;
            }
        });
    });

    // Returner funn
    return {
        team,
        rank,
        group,
        division,
        teamsByDivisionAndGroup
    };
}

