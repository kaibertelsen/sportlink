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
                viewteam(team);
                });

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

                range++;
            }
            

            // Fjern mal-elementet etter å ha lagt til alle rader
            nodeteamhholder.remove();
            list.appendChild(copyelement);
        }
    }
}

function viewteam(team) {
    console.log(team);

    const teamheader = document.getElementById("headerwrapperteam");
    teamheader.querySelector(".teamnameheader").textContent = team.name;
    const teamLogo = teamheader.querySelector(".logoteam");
    if (team.clublogo) teamLogo.src = team.clublogo;
    
    const thismatchinfo = document.getElementById("thismatchinfo");

    const icon = thismatchinfo.querySelector("icon");
    if (team.clublogo) icon.src = match.team1clublogo;
    
    thismatchinfo.querySelector(".clublable").textContent = team.clubname || "";    
    thismatchinfo.querySelector(".divisjon").textContent = team.divisionname || "";
    // Filtrer kampene for laget
    const filteredMatches = matches.filter(
        match => match.team1 === team.airtable || match.team2 === team.airtable
    );

    console.log("Filtered Matches:", filteredMatches);

    // Hent mal-elementet for kampvisning
    const elementlibrary = document.getElementById("elementlibrary");
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
    for (let match of filteredMatches) {
        const matchelement = nodematchholder.cloneNode(true);
        teammatchlist.appendChild(matchelement);
    
        matchelement.onclick = function() {
            viewMatch(match);
        };

           // Konverter datoen til ønsket format
           const matchDate = new Date(match.time); // Antatt at match.date er en ISO-dato eller lignende
           const formattedDate = matchDate.toLocaleDateString("no-NO", {
               day: "numeric",
               month: "short"
           });
   
           // Sett kampdata i radens elementer
           rowelement.querySelector(".teamdatematch").textContent = formatt

        // Oppdater lagnavn eller bruk plassholdere
        const team1Name = match.team1name || match.placeholderteam1 || "Unknown";
        const team2Name = match.team2name || match.placeholderteam2 || "Unknown";
        matchelement.querySelector(".team1").textContent = team1Name;
        matchelement.querySelector(".team2").textContent = team2Name;
    
        // Oppdater logoer (kun hvis det finnes en verdi, ellers behold standard)
        const team1Logo = matchelement.querySelector(".logoteam1");
        const team2Logo = matchelement.querySelector(".logoteam2");
        if (match.team1clublogo) team1Logo.src = match.team1clublogo;
        if (match.team2clublogo) team2Logo.src = match.team2clublogo;
    
        // Oppdater sluttspillinformasjon hvis tilgjengelig
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
    
    
        const settlist = matchelement.querySelector(".settlist");
        const setKeys = ["sett1", "sett2", "sett3"];
        const hasRequiredSetScores = match.sett1 && match.sett2;
    
        if (hasRequiredSetScores) {
            settlist.style.display = "grid";
            const settdivnode = settlist.querySelector(".settdiv");
            let columnCount = 0;
            let team1SetsWon = 0;
            let team2SetsWon = 0;
    
            for (let i = 0; i < setKeys.length; i++) {
                if (match[setKeys[i]]) {
                    const settdiv = settdivnode.cloneNode(true);
                    const setttextlable = settdiv.querySelector(".setttextlable");
                    setttextlable.textContent = match[setKeys[i]];
    
                    const [team1Score, team2Score] = match[setKeys[i]].split('-').map(Number);
                    if (team1Score > team2Score) team1SetsWon++;
                    else if (team2Score > team1Score) team2SetsWon++;
    
                    settlist.appendChild(settdiv);
                    columnCount++;
                }
            }
    
            settdivnode.remove();
            settlist.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
    
            match.goalteam1 = team1SetsWon;
            match.goalteam2 = team2SetsWon;
        } 

        settlist.style.display = "none";
        
        const resultlable = matchelement.querySelector(".resultlable");
        if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
            resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
            resultlable.style.fontWeight = "bold";
            resultlable.style.color = mapColors("main");
            resultlable.style.fontSize = "16px";
        } else {
            resultlable.textContent = formatdatetoTime(match.time);
            resultlable.style.fontWeight = "normal";
        }
    }

    document.getElementById("thisteamtabbutton").click();

}

