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

    activeteam = team;
    // Oppdater header-informasjon
    const teamheader = document.getElementById("headerwrapperteam");
    teamheader.querySelector(".teamnameheader").textContent = team.name || "Ukjent lag";
    teamheader.querySelector(".logoteam").src = team.clublogo || "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png"
    
    const thismatchinfo = document.getElementById("thisteamhinfo");
    
    /*
    const clublogo = thismatchinfo.querySelector(".clublogo");
    if (team.clublogo) clublogo.src = team.clublogo;
    */
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

//Ranking
        // Bestem hvilket element som skal kopieres basert på sportstypen
        let nodeelement = getPointElement();
        const thisteamrankinfo = document.getElementById("thisteamrankinfo");
        const rankview = thisteamrankinfo.querySelector(".rankview");
        rankview.innerHTML = "";
        const copyelement = nodeelement.cloneNode(true);
        copyelement.style.background = 'none';

        rankview.appendChild(copyelement);  
        let teaminfo = findRankForTeam(team);
        //laste inn verdiene
        loadPointsToviewer(rankview,teaminfo.team,teaminfo.rank,true);

        let groupDivisionText = "divisjonen: "+team.divisionname;
        if(teaminfo.group){groupDivisionText = groupDivisionText+" i gruppe: "+teaminfo.group};
        let description = team.name+" er på "+teaminfo.rank+" plass i "+groupDivisionText+".";
        thisteamrankinfo.querySelector(".rankdescription").textContent = description;

////kampoversikten
        const thisteammatchlist = document.getElementById("thisteammatchlist");
        thisteammatchlist.querySelector(".matchinactiveturnament").textContent = "Kamper";
        // Filtrer kampene for laget
        const filteredMatches = matches.filter(
            match => match.team1 === team.airtable || match.team2 === team.airtable
        );

        //finne alle unike lokasjoner og last de inn i locationselector
        const locationselector = document.getElementById("locationSelector");
        if(locationselector){
        loadLocationSelector(filteredMatches,locationselector);
        }

        listMatchesInTeamView(filteredMatches,team);

    // Vis lagsiden
    document.getElementById("thisteamtabbutton").click();
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

    // Hent containeren der kampene skal vises
    const teammatchlist = document.getElementById("teammatchlist");
    if (!teammatchlist) {
        console.warn("Containeren for visning av kamper (teampagecontent) finnes ikke.");
        return;
    }


    // Tøm eksisterende innhold i containeren
    teammatchlist.innerHTML = "";

   
    // Filtrer kampene for laget
    const filteredMatchesTeam = matchs.filter(
        match => match.team1 === team.airtable || match.team2 === team.airtable
    );


  //filtrer kamper på lokasjon om det er satt noe annen en "" i selector
  const locationValue = document.getElementById("locationSelector").value;

  const filteredMatches = filteredMatchesTeam.filter(match => {
    const location = !locationValue || match.location === locationValue;
    return location;
    });

     //oppdaterer counter
     document.getElementById("countermatches").textContent = filteredMatches.length+" stk.";

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


        //oppdaterer lokasjonsnavn
    const locationlable = matchelement.querySelector(".locationlable");
    if(match.location){
        locationlable.textContent = match.location;
        locationlable.style.display = "inline-block";
    }



      // Oppdater sluttspillinformasjon
      const endplayLable = matchelement.querySelector(".endplaylable");
      if (match.typematch) {
          const matchTypeMap = {
              "eighthfinale": "ÅF",
              "quarterfinale": "KF",
              "semifinale": "SF",
              "bronzefinale":"BF",
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
      if (!isThisMacthPlayed(match)) {
          // om kampen ikke er spilt så sett dato og tid i resultatfeltet
          resultlable.innerHTML = formatdatetoDateAndTimeshortInToLines(match.time);
          resultlable.style.fontWeight = "normal";
          resultlable.style.backgroundColor = "transparent";
          resultlable.style.textAlign = "center";
          resultlable.style.fontSize = "12px";
          //skjul annen datoelement
          matchelement.querySelector(".teamdatematch").style.display = "none";

            // Sjekk om tiden nå er forbi kampens tid
          // Sjekk om tiden nå er forbi kampens tid
            const now = new Date(); // Nåværende tid

            // Ekstraksjon av dato og tid fra match.time manuelt
            const matchTimeParts = match.time.split("T"); // Deler dato og tid
            const matchDate = matchTimeParts[0]; // Hent datoen (YYYY-MM-DD)
            const matchTime = matchTimeParts[1].split(".")[0]; // Hent klokkeslettet (HH:mm:ss)

            // Bygg en dato- og tidsstreng uten å ta hensyn til tidssone
            const matchDateTime = new Date(`${matchDate}T${matchTime}`); // Lokal dato/tid uten Z

            // Nåværende tid (uten tidssone-manipulering)
            const nowLocal = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            );

            // Finn playIcon og oppdater basert på tiden
            const playIcon = matchelement.querySelector(".playicon");

            // Beregn tidsdifferanse i minutter
            const timeDifference = (nowLocal - matchDateTime) / (1000 * 60); // Forskjell i minutter

            if (nowLocal > matchDateTime && timeDifference <= 30) {
                // Hvis kampen har startet, men det har gått mindre enn 30 minutter
                if (playIcon) {
                    playIcon.style.display = "flex";
                }
            } else {
                // Hvis tiden er over 30 minutter siden kampstart eller kampen ikke har startet
                if (playIcon) {
                    playIcon.style.display = "none";
                }
            }



      } else {
    
          resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
          resultlable.style.fontWeight = "bold";

          if (match.goalteam1 > match.goalteam2 && match.team1 === team.airtable) {
              resultlable.style.backgroundColor = "green";
          } else if (match.goalteam2 > match.goalteam1 && match.team2 === team.airtable) {
              resultlable.style.backgroundColor = "green";
          } else if (match.goalteam1 == match.goalteam2){
          //uavgjort
              resultlable.style.backgroundColor = "gray";
          }else {
              resultlable.style.backgroundColor = "red";
          }
      }
  }

}

function loadLocationSelector(Matchs,locationSelector) {
    let uniclocations = [];

    // Finn unike location-verdier
    for (let match of Matchs) {
        if (match.location && !uniclocations.includes(match.location)) {
            uniclocations.push(match.location);
        }
    }

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

