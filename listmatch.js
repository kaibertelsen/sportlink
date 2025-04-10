var activeDayFilter = "";

function getMatch(data){
    var body = airtablebodylistAND({tournamentid:data.airtable,archived:0});
    Getlistairtable(baseId,"tblrHBFa60aIdqkUu",body,"getMatchresponse");
}

function getMatchresponse(data,id){
    let matCH = rawdatacleaner(data);
    matches = calculateMatchResultBySett(matCH);

    //list på nytt om ikke det alt er siden er lastet for 20sek siden
    listmatch(matches,"dato");
    
   
}

function groupArraybyDate(matchs) {
    // Initialiser en ny array for grupperte kamper
    let grouparray = [];
    // Bruk reduce for å gruppere kampene etter dato
    let groupedByDate = matchs.reduce((groups, match) => {
        // Hent datoen fra 'time'-feltet, eller bruk standardverdi hvis det ikke finnes
        let matchDate = match.time ? new Date(match.time).toISOString().split('T')[0] : "ikke tidspunkt enda";

        // Hvis datoen ikke finnes i grupperingsobjektet, opprett en ny array for den datoen
        if (!groups[matchDate]) {
            groups[matchDate] = [];
        }

        // Legg til kampen i arrayen for den aktuelle datoen
        groups[matchDate].push(match);

        return groups;
    }, {});

    // Konverter objektet til en array med dato som nøkkel
    grouparray = Object.keys(groupedByDate).map(date => {
        return {
            date: date,
            matches: groupedByDate[date]
        };
    });

    return grouparray;
}

function groupArrayByLocation(matchs) {
    // Initialiser en ny array for grupperte kamper
    let grouparray = [];
  
    // Bruk reduce for å gruppere kampene etter location
    let groupedByLocation = matchs.reduce((groups, match) => {
      // Hent lokasjon eller bruk standardtekst hvis mangler
      let location = match.location && match.location.trim() !== "" ? match.location : "Ukjent lokasjon";
  
      // Hvis lokasjonen ikke finnes i grupperingsobjektet, opprett ny array
      if (!groups[location]) {
        groups[location] = [];
      }
  
      // Legg til kampen i gruppen for den lokasjonen
      groups[location].push(match);
  
      return groups;
    }, {});
  
    // Konverter til array med nøkkel og matches
    grouparray = Object.keys(groupedByLocation).map(location => {
      return {
        location: location,
        matches: groupedByLocation[location]
      };
    });
  
    return grouparray;
}
  
function matchMainListSelectorChange(){

   listmatch(matches,"dato");
   
    
}

function filterMatchesByStatus(matchs) {
    // Finn aktiv filterknapp
    const activeFilterButton = document.querySelector('#matchlistFilter .matchlist-tab.active');
    if (!activeFilterButton) return matchs;

    const filterValue = activeFilterButton.getAttribute('data-filter');
    const statusfilterMatchLable = document.getElementById("statusfilterMatchLable");
    

    if (filterValue === "all") {
        statusfilterMatchLable.textContent = "";
        // Vis alle kamper
        return matchs;
    } else if (filterValue === "upcoming") {
        statusfilterMatchLable.textContent = "Kommende kamper";
        // Kamper som ikke har resultat
        return matchs.filter(match => !match.goalteam1 && !match.goalteam2);
    } else if (filterValue === "live" || filterValue === "ongoing") {
        statusfilterMatchLable.textContent = "Pågående kamper";
        // Kamper som har startet, men ikke har resultat
        return matchs.filter(match => {
            const isMatchPlaying = markMatchIfPlaying(match);
            return isMatchPlaying;
        });
    } else if (filterValue === "played") {
        statusfilterMatchLable.textContent = "Spilte kamper";
        // Kamper som har resultat
        return matchs.filter(match =>
            match.goalteam1 !== undefined &&
            match.goalteam1 !== "" &&
            match.goalteam2 !== undefined &&
            match.goalteam2 !== ""
        );
    }

    // Hvis ingen filterverdi matcher, returner alle
    return matchs;
}

// listmatch function adjusted to avoid scroll conflicts
function listmatch(data, grouptype, scroll) {

    //teste ut ny layout
    listmatchLayoutGrid(data, grouptype);

}

function removeAllExceptSpecific(listElement, keepElement) {
    // Iterer over listen baklengs for å unngå problemer med indeksering ved fjerning
    for (let i = listElement.children.length - 1; i >= 0; i--) {
        const child = listElement.children[i];
        // Sjekk om barnet ikke er det elementet som skal beholdes
        if (child !== keepElement) {
            listElement.removeChild(child);
        }
    }
}

function makeMatchInMatchHolder(data,matchlist,matchholder,firstUnplayedMatch){

    const activeDivision = getActiveDivisionFilter();
    matchlist.parentElement.querySelector(".countermatch").textContent = data.length+" stk.";

    //sjekke om selector er aktiv
    const mselector = document.getElementById("matchMainListSelector");
    let filteredMatches = data;
    if(mselector){
        filteredMatches = filterMatchesBySelector(data);
    }

    //sjekke om noen dagknapper er aktive
    filteredMatches = filterDaybuttons(filteredMatches);

    removeAllExceptSpecific(matchlist, matchholder);

    for (let match of data) {

        let matchelement = makeMatchWrapper(matchholder, match,false,firstUnplayedMatch);
        matchelement.style.display = "block";
        matchlist.appendChild(matchelement);
        /*
        const matchelement = matchholder.cloneNode(true);
        matchlist.appendChild(matchelement);
        matchelement.style.display = "block";
        matchelement.onclick = function() {
            previouspage = "";
            viewMatch(match);
        };

        //sett tidspunkt for kampen
        const matchTime = matchelement.querySelector(".timelable");
        matchTime.textContent = formatdatetoTime(match.time);

        const resultlableteam1 = matchelement.querySelector(".resultlableteam1");
        resultlableteam1.textContent = match.goalteam1 != null ? match.goalteam1 : "";
        
        const resultlableteam2 = matchelement.querySelector(".resultlableteam2");
        resultlableteam2.textContent = match.goalteam2 != null ? match.goalteam2 : "";
    
        // Oppdater logoer (kun hvis det finnes en verdi, ellers behold standard)
        const team1Logo = matchelement.querySelector(".logoteam1");
        const team2Logo = matchelement.querySelector(".logoteam2");
        if (match.team1clublogo) team1Logo.src = match.team1clublogo;
        if (match.team2clublogo) team2Logo.src = match.team2clublogo;

         // Oppdater lagnavn eller bruk plassholdere
         const team1Name = match.team1name || match.placeholderteam1 || "Unknown";
         const team2Name = match.team2name || match.placeholderteam2 || "Unknown";
         matchelement.querySelector(".team1").textContent = team1Name;
         matchelement.querySelector(".team2").textContent = team2Name;

         //oppdaterer lokasjonsnavn
         const locationlable = matchelement.querySelector(".locationtext");
         if(locationView){
             locationlable.style.display = "none";
         }else{
             locationlable.textContent = match.location || "";
         }

    
        // Oppdater sluttspillinformasjon hvis tilgjengelig
        const endplayLable = matchelement.querySelector(".endplaylable");
        if (match.typematch) {
            const matchTypeMap = {
                "eighthfinale": "ÅF",
                "placementfinale":"PK",
                "round2":"R2",
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
    
        const divisionlable = matchelement.querySelector(".divisionlable");
    
        // Bestem tekstinnholdet basert på `activeDivision` og tilgjengelige data
        let labelText;
        if (activeDivision === "") {
            // Når ingen divisjonsfilter er aktivt, inkluder både divisionname og groupname
            labelText = `${match.divisionname || ""} ${match.groupname ? `- ${match.groupname}` : ""}`.trim();
        } else {
            // Når divisjonsfilter er aktivt, bruk kun groupname
            labelText = match.groupname || "";
        }
    
        // Sett tekst og stil hvis `labelText` har verdi, ellers skjul elementet
        if (labelText) {
            divisionlable.textContent = labelText;
            divisionlable.style.color = mapColors("midlemain");
            divisionlable.style.display = "block";
        } else {
            divisionlable.style.display = "none";
        }
    
            // Sjekk om det finnes noen settverdier
            const hasSetValues = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb]
            .some(value => value != null && value.toString().trim() !== "");

    
         if (hasSetValues) {
            // Regne ut stillingen basert på settverdiene
            const sets = [
                { teamA: match.settaa, teamB: match.settab },
                { teamA: match.settba, teamB: match.settbb },
                { teamA: match.settca, teamB: match.settcb },
            ];

            let teamAWins = 0;
            let teamBWins = 0;

            sets.forEach(set => {
                const teamA = parseInt(set.teamA) || 0;
                const teamB = parseInt(set.teamB) || 0;

                if (teamA > teamB) {
                    teamAWins++;
                } else if (teamB > teamA) {
                    teamBWins++;
                }
            });

            match.goalteam1 = teamAWins;
            match.goalteam2 = teamBWins;
        } 

        
        const resultlable = matchelement.querySelector(".resultlable");
        if ((match.goalteam1 === "" || match.goalteam1 === null) || 
            (match.goalteam2 === "" || match.goalteam2 === null)) {
            // Det er ingen resultat

             // Nåværende tid er forbi kampens tid
             resultlable.textContent = formatdatetoTime(match.time);
             resultlable.style.fontWeight = "normal";

             // Sett første upåbegynte kamp
             if (!firstUnplayedMatch) {
                 firstUnplayedMatch = matchelement;
             }

            
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
            resultlable.style.color = mapColors("main");
            resultlable.style.fontSize = "16px";

        }
        /*
        if (item.matches.indexOf(match) === item.matches.length - 1) {
            matchelement.querySelector(".bordholder").style.borderBottom = 'none';
        }
        */
       
    }
    return firstUnplayedMatch;
}

function locationSelectorInMatchlistChange(matches, matchlist, matchholder, selectedValue, firstUnplayedMatch) {
    // Hvis selectedValue er tomt, vis alle kamper
    const filteredMatches = selectedValue === "" 
        ? matches 
        : matches.filter(match => match.location === selectedValue);

    // Kall funksjonen makeMatchInMatchHolder med de filtrerte kampene
    makeMatchInMatchHolder(filteredMatches, matchlist, matchholder, firstUnplayedMatch);
}

function viewMatch(match){
    activematch = match;

    // Justering av headerhøyden og innholdet
    setTimeout(adjustMatchContainer, 500);

    const header = document.getElementById("headerwrappermatch");
   
    // Oppdater lagnavn eller bruk plassholdere
    const team1Name = match.team1name || match.placeholderteam1 || "-";
    const team2Name = match.team2name || match.placeholderteam2 || "-";
    header.querySelector(".team1").textContent = team1Name;
    header.querySelector(".team2").textContent = team2Name;

    let emtyLogo = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png";
    // Oppdater logoer (kun hvis det finnes en verdi, ellers behold standard)
    header.querySelector(".logoteam1").src = match.team1clublogo || emtyLogo;
    header.querySelector(".logoteam2").src = match.team2clublogo || emtyLogo;
   
    const resultlable = header.querySelector(".resultlablemacth");
    let matchIsPlayed = false;
    if ((match.goalteam1 === "" || match.goalteam1 === null) || 
    (match.goalteam2 === "" || match.goalteam2 === null)) {
        resultlable.textContent = formatdatetoTime(match.time);
        resultlable.style.fontWeight = "normal";
        resultlable.style.color = "white";
    } else {
        resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
        resultlable.style.fontWeight = "bold";
        resultlable.style.color = mapColors("main");
        matchIsPlayed = true;
    }
   
    const divisionLabel = header.querySelector(".divisionlablematch");
    divisionLabel.style.display = match?.divisionname ? "block" : "none";
    divisionLabel.textContent = `${match.divisionname || ""} ${match.groupname ? `- ${match.groupname}` : ""}`.trim();

    // Oppdater sluttspillinformasjon hvis tilgjengelig
    const endplayLable = header.querySelector(".endplaylablematch");
    if (match.typematch) {
        const matchTypeMap = {
            "round2":"Runde 2 kamper",
            "placementfinale":"Plasserings kamp",
            "eighthfinale": "8-delsfinale",
            "quarterfinale": "Kvartfinale",
            "semifinale": "Semifinale",
            "bronzefinale": "Bronsefinale",
            "finale": "Finale"
        };

        const endplayText = matchTypeMap[match.typematch] || "Ukjent sluttspill";
        endplayLable.innerHTML = `${match.endplay || ""}<br>${endplayText}`;
        endplayLable.style.display = "block";
    } else {
        endplayLable.style.display = "none";
    }

    //gjøre lagene klikkbare
    const team1button = header.querySelector(".team1button");
    team1button.onclick = function(){
        const team1 = teams.find(t => t.airtable === match.team1);
        if (team1) {
            //sette historikken
            previouspage = "match";
            viewteam(team1);
        }
    }
    const team2button = header.querySelector(".team2button");
    team2button.onclick = function(){
        const team2 = teams.find(t => t.airtable === match.team2);
        if (team2) {
            //sette historikken
            previouspage = "match";
            viewteam(team2);
        }

    }


    const textturnamentname = header.querySelector(".turnamentname");
    if(textturnamentname){textturnamentname.textContent = match.tournamentname};
    
    const matchsettholder = document.getElementById("thismatchsett");
    
     matchsettholder.querySelector(".settaa").textContent = match.settaa || "-";
     matchsettholder.querySelector(".settab").textContent = match.settab || "-";
     matchsettholder.querySelector(".settba").textContent = match.settba || "-";
     matchsettholder.querySelector(".settbb").textContent = match.settbb || "-";
     matchsettholder.querySelector(".settca").textContent = match.settca || "-";
     matchsettholder.querySelector(".settcb").textContent = match.settcb || "-";

     let setsAvailable = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb]
     .some(value => value && value.trim() !== "");

    if(setsAvailable){
        matchsettholder.style.display = "block";
    }else{
        matchsettholder.style.display = "none";
    }

    const matchinfo = document.getElementById("thismatchinfo");
    const resultrapp = matchinfo.querySelector(".resultrapp");
    if(matchIsPlayed){
        resultrapp.style.display = "block";
        let discription = "Kampen er ferdig";
        if(match.overtime){
            discription= "Kampen ble avgjort på overtid ⌛️";
        }else if(match.shootout){
            discription = "Kampen ble avgjort på straffekonkuranse";
        }
        resultrapp.querySelector(".matchdescription").textContent = discription;
        
        if(!match.typematch){
        //dette er ikke en sluttspilkamp
        resultrapp.querySelector(".notendplaymatch").style.display = "block";
        // Oppdater logoer (kun hvis det finnes en verdi, ellers behold standard)
        resultrapp.querySelector(".team1logo").src = match.team1clublogo || emtyLogo;
        resultrapp.querySelector(".team2logo").src = match.team2clublogo || emtyLogo;
        
        let points = pointGenerator(match.goalteam1, match.goalteam2,match.overtime,match.shootout,activetournament.sport[0]);
        resultrapp.querySelector(".team1points").textContent = `${points?.team1point} poeng til ${match.team1name}`;
        resultrapp.querySelector(".team2points").textContent = `${points?.team2point} poeng til ${match.team2name}`;
        }else{
            resultrapp.querySelector(".notendplaymatch").style.display = "none";
        }

    }else{
        resultrapp.style.display = "none";
    }
    //sjekk at contentholder er 140 px pading
    //document.getElementById("matchcontentholder").style.paddingTop = "140px";

    const updateTextContent = (selector, value) => {
        const element = matchinfo.querySelector(selector);
        if (value) {
            element.textContent = value;
            element.parentElement.style.display = "block";
        } else {
            element.parentElement.style.display = "none";
        }
        };
    
        // Oppdater matchinfo med sjekk for tomme eller manglende verdier
        updateTextContent(".field", "Bane: "+match.fieldname);
        updateTextContent(".refereename", match.refereename);

        const timeelement = matchinfo.querySelector(".datetime");
        timeelement.textContent = formatdatetoDateAndTime(match.time)
        
        const calendeicon = matchinfo.querySelector(".calendeicon");
        createICSFile(calendeicon, match);


        const locationElement = matchinfo.querySelector(".location");
        if (match?.fieldlocation) {
            locationElement.parentElement.style.display = "block";
            // Opprett en link med hvit tekst
            locationElement.innerHTML = `<a href="${match.fieldlocation}" target="_blank" rel="noopener noreferrer" style="color: white;">Trykk her for veibeskrivelse</a>`;
        }else if (match?.location){
            locationElement.parentElement.style.display = "block";
            locationElement.textContent = match.location;

        }else {
            locationElement.textContent = "";
            locationElement.parentElement.style.display = "none";
        }
        

       
    const streaming = document.getElementById("streaminggroup");
        if(match?.streaminglink) {
            

            streaming.querySelector(".streaminginfo").textContent = "Sendes "+formatdatetoDateAndTime(match.time);
            streaming.style.display = "block";
            /*
            const iframe = document.getElementById('youtube-iframe');
            const url = new URL(shortURL);
            const videoID = url.pathname.split('/')[1]; // Henter video-ID fra path
            // Sett ny src for iframe med riktig embed URL
            const embedURL = `https://www.youtube.com/embed/${videoID}`;
            iframe.src = embedURL;
            */
        } else {

            streaming.style.display = "none";

        }

    const fieldmap = document.getElementById("fieldmapwrapper");
        if(match?.fieldimage){
            fieldmap.style.display = "block";
            fieldmap.querySelector(".fieldname").textContent = match.fieldname;
            fieldmap.querySelector(".fieldimage").src = match.fieldimage;
        }else{
            fieldmap.style.display = "none";
        }
        

    document.getElementById("thismatchtabbutton").click();
}

function createICSFile(icon, match) {
    const startDate = new Date(match.time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 time varighet

    const formatDate = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);
    const eventTitle = `Kamp ${match.team1name ?? ""} - ${match.team2name ?? ""}`.trim();
    const location = match.location || "";
    const description = match.tournament || "Kamp";

    // Forbedret .ics-innhold
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${eventTitle}
LOCATION:${location}
DESCRIPTION:${description}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR
`.trim();

    // Lag en Blob for .ics-filen
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Sett href direkte på 'icon'-elementet
    icon.href = url;
    icon.download = "event.ics";
    icon.target = "_blank";
    icon.rel = "noopener noreferrer";
}

function adjustMatchContainer() {
    const headerWrapper = document.getElementById("headerwrappermatch");
    const swipeContainer = document.getElementById("matchcontentholder");

    if (headerWrapper && swipeContainer) {
        const headerHeight = headerWrapper.offsetHeight; // Hent høyden på headerwrapper

        // Hent safe area høyde (standard til 0 hvis ikke tilgjengelig)
        const safeAreaInsetTop = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || 0
        );

        // Beregn total padding-top med justering for safe area
        let paddingTop = headerHeight - safeAreaInsetTop;
        if (paddingTop < 150) {
            paddingTop = 150; // Minimum padding
        }

        // Sett padding-top som utregnet verdi
        swipeContainer.style.paddingTop = `${paddingTop}px`;
    }
}

function calculateMatchResultBySett(matchs) {
    for (let match of matchs) {
        const hasSetValues = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb]
            .some(value => value != null && value.toString().trim() !== "");

        if (hasSetValues) {
            const sets = [
                { teamA: match.settaa, teamB: match.settab },
                { teamA: match.settba, teamB: match.settbb },
                { teamA: match.settca, teamB: match.settcb },
            ];

            let teamAWins = 0;
            let teamBWins = 0;

            sets.forEach(set => {
                const teamA = parseInt(set.teamA) || 0;
                const teamB = parseInt(set.teamB) || 0;

                if (teamA > teamB) {
                    teamAWins++;
                } else if (teamB > teamA) {
                    teamBWins++;
                }
            });

            match.goalteam1 = teamAWins;
            match.goalteam2 = teamBWins;
        }
    }

    return matchs;
}

function listmatchLayoutGrid(data) {

    //divisjonsfilter
    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    
    //spillt status filter
    filteredMatches = filterMatchesByStatus(filteredMatches);
    
    //Dagknapper filter
    filteredMatches = filterDaybuttons(filteredMatches);

    let matchs = sortDateArray(filteredMatches, "time");
    let grouparray = [];

   

    //hvelge vilke type gruppering som skal vises
    let locationView = false;
    let groupType = "dato";
    if (!activeDayFilter || activeDayFilter === ""){
        grouparray = groupArraybyDate(matchs);
    }else {
        grouparray = groupArrayByLocation(matchs);
        locationView = true;
        groupType = "location";
    }

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();

    if (filteredMatches.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "Ingen kamper";
        list.appendChild(emptyMessage);
        return;
      }
      

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholderlayoutgrid');

    let firstUnplayedMatch = null;

    for (let item of grouparray) {
        let rowelement = makeGroupMatchWrapper(item,false,nodeelement,groupType,firstUnplayedMatch);
        list.appendChild(rowelement);
    }

    if (firstUnplayedMatch) {
        const swipeListContainer = firstUnplayedMatch.closest('.swipe-container-list');
    
        if (swipeListContainer) {
            const scrollToFirstMatch = () => {
                const elementTop = firstUnplayedMatch.getBoundingClientRect().top;
                const containerTop = swipeListContainer.getBoundingClientRect().top;
                const offset = elementTop - containerTop - (swipeListContainer.clientHeight / 2);
    
                swipeListContainer.scrollTo({
                    top: swipeListContainer.scrollTop + offset,
                    behavior: 'smooth',
                });
            };
    
            // Bruk `requestAnimationFrame` og en ekstra forsinkelse for å sikre at layout er oppdatert
            setTimeout(() => {
                requestAnimationFrame(scrollToFirstMatch);
            }, 300);
        }
    }
    
}

function makeGroupMatchWrapper(item,team,nodeelement,grouptype,firstUnplayedMatch){

    const rowelement = nodeelement.cloneNode(true);

    const groupheadername = rowelement.querySelector(".groupheadername");
    const underlineheader = rowelement.querySelector(".underlineheader");
    const locationSelector = rowelement.querySelector(".locationselector");
    const closeopengroupbutton = rowelement.querySelector(".closeopengroupbutton");

    if (grouptype === "dato") {
        groupheadername.textContent = isNaN(Date.parse(item.date))
          ? item.date
          : formatDateToNorwegian(item.date);

          //last inn alle de forskjellige lokasjoner i denne velgeren
          if(locationSelector){
              loadLocationSelector(item.matches,locationSelector);
                  // Legg til en change-eventlistener for locationSelector
              locationSelector.addEventListener("change", () => {
                  // Hent valgt verdi fra selectoren
                  const selectedValue = locationSelector.value;

                  // Kjør funksjonen med item.matches, matchList og valgt verdi
                  locationSelectorInMatchlistChange(item.matches, matchlist,matchholder, selectedValue,firstUnplayedMatch);
              });
          }

          underlineheader.style.display = "none";
          closeopengroupbutton.style.display = "none";
          locationSelector.style.display = "block";

      } else {
          //viser lokasjonsnavn
          groupheadername.textContent = item.location;
          locationSelector.style.display = "none";

          //kan dato vises på underline
          const date = item.matches[0].time.split("T")[0];
          const dateString = formatDateToNorwegian(date);
          underlineheader.textContent = dateString;
          underlineheader.style.display = "block";

          //vise knap som kan lukke og åpne matchlist
          closeopengroupbutton.style.display = "block";
          closeopengroupbutton.onclick = function() {
              // Toggle matchlist visibility
          toggleMatchList(rowelement, closeopengroupbutton);
          };

      }

    // Oppdaterer antall kamper i gruppen
    const countermatch = rowelement.querySelector(".countermatch");
    countermatch.textContent = item.matches.length+" stk."

    const matchlist = rowelement.querySelector(".matchlist");
    const matchholder = rowelement.querySelector('.matchholder');
    const isOnlyOneLocation = findUnicLocations(item.matches).length === 1;


    for (let match of item.matches) {
        
        let matchelement = makeMatchWrapper(matchholder,match,team,grouptype,firstUnplayedMatch,isOnlyOneLocation);

        //fjerner understrek på siste kamp i listen
        if (item.matches.indexOf(match) === item.matches.length - 1) {
            matchelement.querySelector(".bordholder").style.borderBottom = 'none';
        }

        matchlist.appendChild(matchelement);

    }
   
    //skuler mal element
    matchholder.style.display = "none";

    return rowelement;
}

function makeMatchWrapper(nodeelement,match,team,grouptype,firstUnplayedMatch,isOnlyOneLocation){

    let matchelement = nodeelement.cloneNode(true);   
    
    const activeDivision = getActiveDivisionFilter();

    matchelement.onclick = function() {
        previouspage = "";
        viewMatch(match);
    };

    //sett tidspunkt for kampen
    const matchTime = matchelement.querySelector(".timelable");
    matchTime.textContent = formatdatetoTime(match.time);
    
    const resultlableteam1 = matchelement.querySelector(".resultlableteam1");
    resultlableteam1.textContent = match.goalteam1 != null ? match.goalteam1 : "";
    
    const resultlableteam2 = matchelement.querySelector(".resultlableteam2");
    resultlableteam2.textContent = match.goalteam2 != null ? match.goalteam2 : "";
    
    // Oppdater logoer (kun hvis det finnes en verdi, ellers behold standard)
    const team1Logo = matchelement.querySelector(".logoteam1");
    const team2Logo = matchelement.querySelector(".logoteam2");
    if (match.team1clublogo) team1Logo.src = match.team1clublogo;
    if (match.team2clublogo) team2Logo.src = match.team2clublogo;
  
    // Oppdater lagnavn eller bruk plassholdere
    const team1Name = match.team1name || match.placeholderteam1 || "Unknown";
    const team2Name = match.team2name || match.placeholderteam2 || "Unknown";
    matchelement.querySelector(".team1").textContent = team1Name;
    matchelement.querySelector(".team2").textContent = team2Name;


    // Oppdaterer lokasjonsnavn
    const locationLabel = matchelement.querySelector(".locationtext");
    const fieldName = match.fieldname || "";
    const locationName = match.location || "";

    if (grouptype === "location" || isOnlyOneLocation) {
    // Lokasjon vises allerede på gruppenivå – kun vis felt
    locationLabel.textContent = "Bane: "+fieldName;
    } else {
    // Sett sammen lokasjon + felt hvis felt finnes
    const locationText = fieldName
        ? `${locationName} (${fieldName})`
        : locationName;

    locationLabel.textContent = locationText;
    }

    //oppdater dommer
    const destinationlable = matchelement.querySelector(".refereename");
    let refereenametext = match.refereename || "";
    destinationlable.textContent = refereenametext; 
    
    // Oppdater sluttspillinformasjon hvis tilgjengelig
    const endplayLable = matchelement.querySelector(".endplaylable");
    if (match.typematch) {
        const matchTypeMap = {
            "eighthfinale": "ÅF",
            "placementfinale":"PK",
            "round2":"R2",
            "quarterfinale": "KF",
            "semifinale": "SF",
            "bronzefinale":"BF",
            "finale": "F"
        };

        const endplayText = matchTypeMap[match.typematch] || "Ukjent sluttspill";
        endplayLable.textContent = `${endplayText} - ${match.endplay || ""}`;
        endplayLable.style.display = "inline-block";
    } else {
        endplayLable.style.display = "none";
    }

    // Divisjonsnavn og gruppenavn
    const divisiontext = matchelement.querySelector(".divisiontext");
    const grouptext = matchelement.querySelector(".grouptext");

    if (activeDivision === "") {
        //Vis både divisionname og groupname
        divisiontext.textContent = match.divisionname || "";
        grouptext.textContent = match.groupname || "";
    } else {
        // Når divisjonsfilter er aktivt, vis gkun roupname
        divisiontext.textContent = "";
        grouptext.textContent = match.groupname || "";
    }

    const resultwrapper = matchelement.querySelector(".resultwrapper");

    if (match.goalteam1 == null || match.goalteam1 === "" || 
        match.goalteam2 == null || match.goalteam2 === "") {
            // Det er ingen resultat
            //skjul resultater
            resultlableteam1.textContent = "-";
            resultlableteam2.textContent = "-";
            
           
            // Sett denne som første upåbegynte kamp for scrollen
            if (!firstUnplayedMatch) {
                firstUnplayedMatch = matchelement;
            }

            
            let isMatchPlaying = markMatchIfPlaying(match);

            // Finn playIcon og oppdater basert på tiden
            const playIcon = matchelement.querySelector(".playicon");

            if (isMatchPlaying) {
                    playIcon.style.display = "block";
            }else {
                    playIcon.style.display = "none";
            }
            
    }
    //markerer farge på resultatene
    makeColorOnResult(team,match,resultwrapper);

    return matchelement;
}

function makeColorOnResult(team, match, resultLabel) {
    // Konverter til tall hvis mulig, ellers null
    const goal1 = match.goalteam1 != null && match.goalteam1 !== "" ? parseInt(match.goalteam1) : null;
    const goal2 = match.goalteam2 != null && match.goalteam2 !== "" ? parseInt(match.goalteam2) : null;

    if (!team) {
        // Nøytral visning – blå hvis spilt, grå hvis ikke
        if (goal1 == null || goal2 == null) {
            resultLabel.style.backgroundColor = "#2c2c2d"; // Ikke spilt
        } else {
            resultLabel.style.backgroundColor = "#0b344f"; // Spilt
        }
    } else {
        // Lagspesifikk visning
        if (goal1 != null && goal2 != null) {
            const isTeam1 = match.team1 === team.airtable;
            const isTeam2 = match.team2 === team.airtable;

            if ((goal1 > goal2 && isTeam1) || (goal2 > goal1 && isTeam2)) {
                resultLabel.style.backgroundColor = "green"; // Vunnet
            } else if (goal1 === goal2) {
                resultLabel.style.backgroundColor = "gray"; // Uavgjort
            } else {
                resultLabel.style.backgroundColor = "red"; // Tapt
            }
        } else {
            resultLabel.style.backgroundColor = "#2c2c2d"; // Ikke spilt
        }
    }
}

function markMatchIfPlaying(match) {
    const now = new Date();
  
    if (!match.time) return false;
  
    try {
      // Del opp tidspunktet fra ISO-streng
      const [datePart, timePart] = match.time.split("T");
      const cleanTime = timePart.split(".")[0]; // Fjerner evt. millisekunder
  
      const matchDateTime = new Date(`${datePart}T${cleanTime}`);
  
      // Lag en ny Date uten tidssone-manipulering for nå
      const nowLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );
  
      // Forskjell i minutter
      const timeDifference = (nowLocal - matchDateTime) / (1000 * 60);
  
      // Standard spilletid: 30 minutter
      let timePlaying = 30;
  
      if (match.minutesperperiod && match.numberofperiods) {
        timePlaying = Number(match.minutesperperiod) * Number(match.numberofperiods);
      }
  
      return nowLocal > matchDateTime && timeDifference <= timePlaying;
  
    } catch (err) {
      console.error("Feil ved parsing av kampdato:", err);
      return false;
    }
}
  

function toggleMatchList(rowelement, closeopengroupbutton) {
    const matchlist = rowelement.querySelector(".matchlist");
    const headerdiv = rowelement.querySelector(".headerdiv");

    // Finn aktiv filterknapp
    const activeFilterButton = document.querySelector('#matchlistFilter .matchlist-tab.active');
    const filterValue = activeFilterButton.getAttribute('data-filter');


  
    // Hvis ingen eksplisitt høyde er satt, og display er block → regnes som åpen
    const isCollapsed = getComputedStyle(matchlist).display === "none" || 
                        getComputedStyle(matchlist).height === "0px";
  
    if (isCollapsed) {
      // Åpne
      //hviser bord på headerdiv element #474747
        headerdiv.style.borderBottom = "1px solid #474747";

        matchlist.style.display = "block";
        const fullHeight = matchlist.scrollHeight + "px";
    
        matchlist.style.height = "0px";
        matchlist.style.overflow = "hidden";
        void matchlist.offsetWidth;
    
        matchlist.style.transition = "height 300ms ease";
        matchlist.style.height = fullHeight;

       
    
      setTimeout(() => {
        matchlist.style.height = "";
        matchlist.style.transition = "";
        matchlist.style.overflow = "";
      }, 300);
  
      closeopengroupbutton.style.transition = "transform 300ms ease";
      closeopengroupbutton.style.transform = "rotate(0deg)";
    } else {
      // Lukk

        //fjerne bord på headerdiv element
        headerdiv.style.borderBottom = "none";

      const fullHeight = matchlist.scrollHeight + "px";
  
      matchlist.style.height = fullHeight;
      matchlist.style.overflow = "hidden";
      void matchlist.offsetWidth;
  
      matchlist.style.transition = "height 300ms ease";
      matchlist.style.height = "0px";
  
      setTimeout(() => {
        matchlist.style.display = "none";
        matchlist.style.height = "";
        matchlist.style.transition = "";
        matchlist.style.overflow = "";
      }, 300);
  
      closeopengroupbutton.style.transition = "transform 300ms ease";
      closeopengroupbutton.style.transform = "rotate(180deg)";
    }
}
  
function loadDayfilter(data) {
    const dayScrollContainer = document.getElementById('dayScrollContainer');
    if (!dayScrollContainer) return;

    dayScrollContainer.innerHTML = ''; // Tøm containeren

    const dateSet = new Set();
    data.forEach(match => {
        if (!match.time) return;
        const dateOnly = new Date(match.time).toISOString().split('T')[0];
        dateSet.add(dateOnly);
    });

    const sortedDates = Array.from(dateSet).sort();
    const dayNames = ['Søn.', 'Man.', 'Tir.', 'Ons.', 'Tor.', 'Fre.', 'Lør.'];
    const monthNames = ['jan', 'feb', 'mars', 'apr', 'mai', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'des'];

    let todayButton = null;
    let firstDateButton = null;

    let firstLoad = true; // 👈 flagg for første lasting

    const setActiveButton = (targetButton, selectedDate) => {
        document.querySelectorAll('.day-button').forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
        activeDayFilter = selectedDate;

        // Kjør listmatch **kun** hvis det ikke er første gang
        if (!firstLoad) {
            listmatch(matches);
        }
    };

    // 👉 "Alle"-knapp
    const allButton = document.createElement('button');
    allButton.classList.add('day-button', 'active');
    allButton.innerHTML = `
      <span class="day-label">Alle</span>
      <span class="date-label">Dager</span>
    `;
    allButton.addEventListener('click', () => setActiveButton(allButton, ""));
    dayScrollContainer.appendChild(allButton);

    // 👉 Dato-knapper
    sortedDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        const dayLabel = isToday ? 'Idag' : dayNames[date.getDay()];
        const dateLabel = `${date.getDate()}. ${monthNames[date.getMonth()]}`;

        const button = document.createElement('button');
        button.classList.add('day-button');

        if (isToday) todayButton = button;
        if (!firstDateButton) firstDateButton = button;

        button.innerHTML = `
            <span class="day-label">${dayLabel}</span>
            <span class="date-label">${dateLabel}</span>
        `;
        button.addEventListener('click', () => setActiveButton(button, dateStr));
        dayScrollContainer.appendChild(button);
    });

    // 👉 Scroll og aktiver riktig knapp (men IKKE kjør listmatch ennå)
    const buttonToClick = todayButton || allButton;
    if (buttonToClick) {
        setTimeout(() => {
            setActiveButton(buttonToClick, buttonToClick === allButton ? "" : sortedDates[0]);
            buttonToClick.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            firstLoad = false; // ✅ Etter første gang
        }, 0);
    }
}

function filterDaybuttons(data) {
    // Hvis filteret er tomt eller ikke satt, returner alle kamper
    if (!activeDayFilter || activeDayFilter === "") return data;
  
    // Formatér valgt dato til YYYY-MM-DD
    const filterDate = new Date(activeDayFilter).toISOString().split('T')[0];
  
    // Filtrer kampene basert på dato
    return data.filter(match => {
      if (!match.time) return false;
  
      const matchDate = new Date(match.time).toISOString().split('T')[0];
      return matchDate === filterDate;
    });
}

function initDayFilterToggle() {
    const filterButton = document.getElementById('filterstartbutton');
    const dayFilterWrapper = document.getElementById('dayfilterwrapper');
    const matchlistholder = document.getElementById('matchlistholder');
    const statusfilterMatchLable = document.getElementById("statusfilterMatchLable");
  
    if (!filterButton || !dayFilterWrapper || !matchlistholder) return;
  
    let isExpanded = false;
  
    const originalHeight = 53;
    const expandedHeight = 103;
  
    const originalBottom = -53;
    const expandedBottom = -103;
  
    // Hent faktisk padding-top fra stil
    const computedStyle = window.getComputedStyle(matchlistholder);
    const originalPaddingTop = parseInt(computedStyle.paddingTop) || 0;
  
    const expandedPaddingTop = originalPaddingTop + (expandedHeight - originalHeight);
  
    // Sett overgang og behold eksisterende padding-verdi
    dayFilterWrapper.style.height = `${originalHeight}px`;
    dayFilterWrapper.style.bottom = `${originalBottom}px`;
    dayFilterWrapper.style.overflow = 'hidden';
    dayFilterWrapper.style.transition = 'height 300ms ease, bottom 300ms ease';
  
    matchlistholder.style.transition = 'padding 300ms ease';
  
    const collapse = () => {
      isExpanded = false;
      let exsizeM = 0;
      let exsizeP = 0;
      if(statusfilterMatchLable.textContent !== ""){
        statusfilterMatchLable.style.display = "block";
        exsizeP = 15;
        exsizeM = -15;
      }
      
      dayFilterWrapper.style.height = `${originalHeight+exsizeP}px`;
      dayFilterWrapper.style.bottom = `${originalBottom+exsizeM}px`;
      matchlistholder.style.paddingTop = `${originalPaddingTop+exsizeP}px`;
      
    };
  
    filterButton.addEventListener('click', (e) => {
      e.preventDefault();
      isExpanded = !isExpanded;

      let exsizeM = 0;
      let exsizeP = 0;
      if(statusfilterMatchLable.textContent !== ""){
        exsizeP = 15;
        exsizeM = -15;
      }
      // Toggle mellom å vise og skjule filteret
        if (isExpanded) {
            // Hvis filteret er åpent, lukk det
            statusfilterMatchLable.style.display = "none";
        } else {
            // Hvis filteret er lukket, skjul det
            statusfilterMatchLable.style.display = "block";
        }
      dayFilterWrapper.style.height = isExpanded ? `${expandedHeight}px` : `${originalHeight+exsizeP}px`;
      dayFilterWrapper.style.bottom = isExpanded ? `${expandedBottom}px` : `${originalBottom+exsizeM}px`;
      matchlistholder.style.paddingTop = isExpanded ? `${expandedPaddingTop}px` : `${originalPaddingTop+exsizeP}px`;
    });
  
    const handleOutsideInteraction = (e) => {
      const isClickInside =
        dayFilterWrapper.contains(e.target) || filterButton.contains(e.target);
      if (!isClickInside) {
        collapse();
      }
    };
  
    document.addEventListener('click', handleOutsideInteraction);
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
}
  
function initMatchlistFilter() {
    const filterButtons = document.querySelectorAll('#matchlistFilter .matchlist-tab');
 

    let isInitialSetup = true;
  
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Fjern aktiv status fra alle
        filterButtons.forEach(btn => btn.classList.remove('active'));
  
        // Sett valgt knapp som aktiv
        button.classList.add('active');
  
        // Ikke kjør listmatch på første oppsett
        if (!isInitialSetup) {
          listmatch(matches); // 👈 din funksjon her
        }
      });
    });
  
    // Etter at event listeners er satt opp, slå av init-modus
    setTimeout(() => {
      isInitialSetup = false;
    }, 0);
  }

function resetMatchlistFilter() {
    const filterButtons = document.querySelectorAll('#matchlistFilter .matchlist-tab');
    const allButton = document.querySelector('#matchlistFilter .matchlist-tab[data-filter="all"]');
  
    if (!allButton) return;
  
    // Fjern .active fra alle
    filterButtons.forEach(btn => btn.classList.remove('active'));
  
    // Sett "Alle"-knappen som aktiv
    allButton.classList.add('active');
  
  }
  
  
  
  
  