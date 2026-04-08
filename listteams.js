function getTeams(){
    var body = airtablebodylistAND({tournamentid:activetournament.airtable,archived:0});
    Getlistairtable(baseId,"tbl3ta1WZBr6wKPSp",body,"getTeamresponse");
}

function getTeamresponse(data){
    teams = rawdatacleaner(data);
    listteams(teams);
}

function listteams(data) {
    console.time("listteams");
    console.log("viewteam: listteams kallt med", data.length, "lag");
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
        /*
    //sorter gruppenavn evt divisjonsnavn alfabetisk
        // Hent og sorter nøklene i root-objektet alfabetisk
        const sortedKeys = Object.keys(teamsByDivisionAndGroup).sort();

        // Opprett et nytt objekt med de sorterte nøklene
        const sortedObject = {};
        for (const key of sortedKeys) {
            sortedObject[key] = teamsByDivisionAndGroup[key];
        }
        */

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
                loadPointsToviewer(rowelement,team,range,false);
                range++;
            }
            

            // Fjern mal-elementet etter å ha lagt til alle rader
            nodeteamhholder.remove();
            list.appendChild(copyelement);
        }
    }
    console.timeEnd("listteams");
}

// Rask tab-bytte som unngår Webflow's tunge animasjon
function fastSwitchTab(tabButtonId) {
    var tabButton = document.getElementById(tabButtonId);
    if (!tabButton) return;

    var targetTab = tabButton.getAttribute("data-w-tab");
    var tabMenu = tabButton.closest(".w-tab-menu");
    var tabContent = tabMenu ? tabMenu.parentElement.querySelector(".w-tab-content") : null;
    if (!tabContent) return;

    // Fjern active fra alle tab-links
    var links = tabMenu.querySelectorAll(".w-tab-link");
    for (var i = 0; i < links.length; i++) {
        links[i].classList.remove("w--current");
    }
    tabButton.classList.add("w--current");

    // Fjern active fra alle tab-panes, vis riktig
    var panes = tabContent.querySelectorAll(".w-tab-pane");
    for (var j = 0; j < panes.length; j++) {
        var pane = panes[j];
        if (pane.getAttribute("data-w-tab") === targetTab) {
            pane.classList.add("w--tab-active");
            pane.style.display = "block";
            pane.style.opacity = "1";
        } else {
            pane.classList.remove("w--tab-active");
            pane.style.display = "none";
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

function loadPointsToviewer(rowelement,team,range,solo){
    const sportId = activetournament.sport[0];

   // Rangering
   const rangenr = rowelement.querySelector(".rangenr");
   rangenr.textContent = range;

   // Laglogo
   const logoteam = rowelement.querySelector(".clublogo");
   if (team.clublogo) logoteam.src = team.clublogo;
   //logoteam.removeAttribute('srcset');
   //logoteam.src = team.clublogo;

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
       rowelement.querySelector(".penaltymin").textContent = team.points.penaltymin;
       rowelement.querySelector(".points").textContent = team.points.points;
   }else{
        // standard Målstatistikk for fotball
        rowelement.querySelector(".drawn").textContent = team.points.drawn;
        rowelement.querySelector(".goalsfa").textContent = `${team.points.goalsFor}-${team.points.goalsAgainst}`;
        rowelement.querySelector(".goaldifference").textContent = team.points.goalDifference;
        rowelement.querySelector(".points").textContent = team.points.points;
   }

   if(solo){
    // Sett bakgrunnen til transparent
    rowelement.style.background = "transparent";
    rowelement.querySelector(".groupheadername").style.display = "none";
    rowelement.querySelector(".teaminfoholder").innerHTML = "";
   }

}

function viewteam(team) {
    console.time("viewteam-total");
    console.log("viewteam: START klikk på:", team.name);

    activeteam = team;

    // -- Rask oppdatering: header vises umiddelbart --
    const teamheader = document.getElementById("headerwrapperteam");
    teamheader.querySelector(".teamnameheader").textContent = team.name || "Ukjent lag";
    teamheader.querySelector(".logoteam").src = team.clublogo || "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png"

    const thismatchinfo = document.getElementById("thisteamhinfo");
    thismatchinfo.querySelector(".divisjon").textContent = team.divisionname || "Ukjent divisjon";
    let grouplable = thismatchinfo.querySelector(".groupname");
    if(team.group){
        grouplable.textContent = team.groupname;
        grouplable.parentElement.style.display = "block";
    }else{
        grouplable.textContent = "";
        grouplable.parentElement.style.display = "none";
    }
    thismatchinfo.querySelector(".clublable").textContent = team.clubname || "Ukjent klubb";

    // Fjern tunge lister fra DOM for å redusere 20000+ noder
    var viewteamStartTime = performance.now();
    var matchlistholder = document.getElementById("matchlistholder");
    var teamslistholder = document.getElementById("teamslistholder");
    var endplaylist = document.getElementById("endplaylist");
    var statisticslistcontent = document.getElementById("statisticslistcontent");

    // Lagre innholdet og tøm DOM
    var savedMatchHTML = matchlistholder ? matchlistholder.innerHTML : "";
    var savedTeamsHTML = teamslistholder ? teamslistholder.innerHTML : "";
    var savedEndplayHTML = endplaylist ? endplaylist.innerHTML : "";
    var savedStatsHTML = statisticslistcontent ? statisticslistcontent.innerHTML : "";

    if (matchlistholder) matchlistholder.innerHTML = "";
    if (teamslistholder) teamslistholder.innerHTML = "";
    if (endplaylist) endplaylist.innerHTML = "";
    if (statisticslistcontent) statisticslistcontent.innerHTML = "";

    var nodesAfterClear = document.querySelectorAll("*").length;
    console.log("viewteam: DOM etter tømming: " + nodesAfterClear);

    // Naviger til lagsiden
    document.getElementById("thisteamtabbutton").click();

    // Gjenopprett innhold etter at tab er byttet (innholdet er nå i skjult tab)
    requestAnimationFrame(function() {
        if (matchlistholder) matchlistholder.innerHTML = savedMatchHTML;
        if (teamslistholder) teamslistholder.innerHTML = savedTeamsHTML;
        if (endplaylist) endplaylist.innerHTML = savedEndplayHTML;
        if (statisticslistcontent) statisticslistcontent.innerHTML = savedStatsHTML;
        console.log("viewteam: DOM gjenopprettet " + (performance.now() - viewteamStartTime).toFixed(0) + "ms");
    });

    // -- Alt i én requestAnimationFrame --
    requestAnimationFrame(function() {
        try {
        console.log("viewteam: rAF startet " + (performance.now() - viewteamStartTime).toFixed(0) + "ms");

        console.time("viewteam-rank");
        const nodeelement = getPointElement();
        const thisteamrankinfo = document.getElementById("thisteamrankinfo");
        const rankview = thisteamrankinfo.querySelector(".rankview");
        rankview.innerHTML = "";
        const copyelement = nodeelement.cloneNode(true);
        copyelement.style.background = 'none';
        rankview.appendChild(copyelement);
        const teaminfo = findRankForTeam(team);
        loadPointsToviewer(rankview, teaminfo.team, teaminfo.rank, true);

        const groupDivisionText = team.divisionname + (teaminfo.group ? " i gruppe: " + teaminfo.group : "");
        thisteamrankinfo.querySelector(".rankdescription").textContent =
            team.name + " er på " + teaminfo.rank + " plass i divisjonen: " + groupDivisionText + ".";
        console.timeEnd("viewteam-rank");

        // Filtrer kamper én gang
        const filteredMatches = matches.filter(
            match => match.team1 === team.airtable || match.team2 === team.airtable
        );
        console.log("viewteam: antall kamper for lag:", filteredMatches.length, "totalt:", matches.length);

        console.time("viewteam-playerStats");
        viewPlayerStats(team, filteredMatches);
        console.timeEnd("viewteam-playerStats");

        console.time("viewteam-matchlist");
        const thisteammatchlist = document.getElementById("thisteammatchlist");
        thisteammatchlist.querySelector(".matchinactiveturnament").textContent = "Kamper";

        const locationselector = document.getElementById("locationSelector");
        if (locationselector) {
            loadLocationSelector(filteredMatches, locationselector);
        }

        listMatchesInTeamView(filteredMatches, team);
        console.timeEnd("viewteam-matchlist");
        console.timeEnd("viewteam-total");
        console.log("viewteam: FERDIG " + (performance.now() - viewteamStartTime).toFixed(0) + "ms");

        } catch(e) {
            console.error("viewteam FEIL: " + e.message + " stack: " + e.stack);
        }
    });
}

function locationSelectorinTeamChange(){
    listMatchesInTeamView(matches,activeteam);
}

function listMatchesInTeamView(matchs,team){

    // Hent mal-elementet for kampvisning
    const elementlibrary = document.getElementById("elementlibrary");
    const nodematchholder = elementlibrary.querySelector(".teampagematch");
    if (!nodematchholder) {
        console.warn("Mal-elementet for kampvisning (.teampagematch) finnes ikke.");
        return;
    }

    
    // Filtrer kampene for laget
    const filteredMatchesTeam = matchs.filter(
        match => match.team1 === team.airtable || match.team2 === team.airtable
    );

    //oppdaterer counter
    document.getElementById("countermatches").textContent = filteredMatchesTeam.length+" stk.";

    //lage grupper på dato
    let grouparray = groupArraybyDate(filteredMatchesTeam);

    // Hent containeren der kampene skal vises
    const list = document.getElementById("teammatchlist");
    if (!teammatchlist) {
        console.warn("Containeren for visning av kamper (teampagecontent) finnes ikke.");
        return;
    }
    // Tøm eksisterende innhold i containeren
    teammatchlist.innerHTML = "";
    const nodeelement = elementlibrary.querySelector('.groupholderlayoutgrid');

    const fragment = document.createDocumentFragment();
    for (let item of grouparray) {
        fragment.appendChild(makeGroupMatchWrapper(item, team, nodeelement, "dato"));
    }
    list.appendChild(fragment);
     
}

function loadLocationSelector(Matchs,locationSelector) {

    let uniclocations = findUnicLocations(Matchs);

    // Tøm eksisterende options
    locationSelector.innerHTML = "";

    if(uniclocations.length ==1){
        //det er bare denne option ikke legg til standard
    }else{
    // Legg til en standard tom option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Alle lokasjoner";
    defaultOption.value = "";
    locationSelector.appendChild(defaultOption);
    }
     // Legg til unike locations som options
     for (let location of uniclocations) {
         const option = document.createElement("option");
         option.textContent = location;
         option.value = location;
         locationSelector.appendChild(option);
     }

    locationSelector.style.display = "block"; 
   
}

function findUnicLocations(data){
    let uniclocations = [];
    for (let match of data) {
        if (match.location && !uniclocations.includes(match.location)) {
            uniclocations.push(match.location);
        }
    }
    return uniclocations;
}


function findRankForTeam(team) {
    // Filtrer lagene basert på divisjon (poeng er allerede beregnet av listteams)
    let filteredTeams = teams.filter(t => t.division === team.division);

    // Gruppér lagene etter divisjon og gruppe (bruker eksisterende points-data)
    const teamsByDivisionAndGroup = filteredTeams.reduce((acc, t) => {
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

function viewPlayerStats(team, teamMatches) {
    let rawPlayers = team.player || [];
  
    // Sammenslå spillere med samme navn og nummer
    const playerMap = new Map();
  
    rawPlayers.forEach(player => {
      const key = `${player.nr || ""}|${player.name}`;
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          nr: player.nr,
          name: player.name,
          sumgoal: Number(player.sumgoal) || 0,
          sumassist: Number(player.sumassist) || 0,
          sumpenaltyminutes: Number(player.sumpenaltyminutes) || 0,
        });
      } else {
        const existing = playerMap.get(key);
        existing.sumgoal += Number(player.sumgoal) || 0;
        existing.sumassist += Number(player.sumassist) || 0;
        existing.sumpenaltyminutes += Number(player.sumpenaltyminutes) || 0;
      }
    });
  
    const players = Array.from(playerMap.values()).filter(player =>
      player.sumgoal > 0 || player.sumassist > 0 || player.sumpenaltyminutes > 0
    );
  
    const playerStatView = document.getElementById("playerStratview");
    playerStatView.innerHTML = "";
  
    if (!players.length) {
      playerStatView.innerHTML = "<p>Ingen statistikk registrert for laget.</p>";
      return;
    }
  
    const goalScorers = [...players]
      .filter(p => p.sumgoal > 0)
      .sort((a, b) => (Number(a.nr) || 9999) - (Number(b.nr) || 9999));

    const assisters = [...players]
      .filter(p => p.sumassist > 0)
      .sort((a, b) => (Number(a.nr) || 9999) - (Number(b.nr) || 9999));

    const penalized = [...players]
      .filter(p => p.sumpenaltyminutes > 0)
      .sort((a, b) => (Number(a.nr) || 9999) - (Number(b.nr) || 9999));
  
    const formatPlayerName = (player) => {
      return player.nr ? `<strong>${player.nr}. ${player.name}</strong>` : `<strong>${player.name}</strong>`;
    };
  
    const createSection = (title, items, valueKey, unit) => {
      if (!items.length) return "";
      let html = `<div style="margin-bottom: 1em;"><strong style="font-size: 1.1em;">${title}</strong><ul style="margin: 0.5em 0; padding-left: 1em;">`;
      items.forEach(player => {
        html += `<li>${formatPlayerName(player)} – ${player[valueKey]} ${unit}</li>`;
      });
      html += "</ul></div>";
      return html;
    };
  
    // Beregn keeperstatistikk fra matchlogg
    let goalsAgainst = 0;
    let shotsAgainst = 0;

    if (teamMatches && teamMatches.length > 0) {
      teamMatches.forEach(match => {
        if (!Array.isArray(match.matchlogg)) return;
        match.matchlogg.forEach(log => {
          const logTeam = Array.isArray(log.team) ? log.team[0] : log.team;
          if (logTeam && logTeam !== team.airtable) {
            if (log.eventtypelable === "Mål") goalsAgainst++;
            else if (log.eventtypelable === "Skudd på mål") shotsAgainst++;
          }
        });
      });
    }

    const totalShotsAgainst = shotsAgainst + goalsAgainst;
    const savePercentage = totalShotsAgainst > 0
      ? Math.round((shotsAgainst / totalShotsAgainst) * 100)
      : null;

    // Vises kun om det finnes skudd på mål-logger
    let keeperSection = "";
    if (shotsAgainst > 0) {
      keeperSection = `<div style="margin-bottom: 1em;">
        <strong style="font-size: 1.1em;">Keeper</strong>
        <ul style="margin: 0.5em 0; padding-left: 1em;">
          <li>Mål imot: <strong>${goalsAgainst}</strong></li>
          <li>Skudd på mål imot: <strong>${totalShotsAgainst}</strong></li>
          <li>Redningsprosent: <strong>${savePercentage}%</strong></li>
        </ul>
      </div>`;
    }

    const html = `
      ${createSection("Målscorere", goalScorers, "sumgoal", "mål")}
      ${createSection("Assist", assisters, "sumassist", "assist")}
      ${createSection("Utvisningsminutter", penalized, "sumpenaltyminutes", "min")}
      ${keeperSection}
    `;

    playerStatView.innerHTML = html;
  }
  

  
  