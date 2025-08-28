var maxGoalDiff = 100; // Standardverdi for maks målforskjell

function getTournament(klientid) {
    var body = airtablebodylistAND({klientid:klientid,archived:0,hidden:0});
    Getlistairtable(baseId,"tblGhVlhWETNvhrWN",body,"getTournamentresponse",true);
}

function getTournamentresponse(data){
    tournament = rawdatacleaner(data);
   
    listOrganizer(tournament);
    listSports(tournament);
    //sorter på dato
    listTournament(sortDateArray(tournament,"startdate"));
    goToObjectShareKey();

    //sjekke hvilke land brukeren er i
    checkUserCountry();

}

function checkUserCountry(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Bruk en geokodingstjeneste for å få land basert på koordinatene
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                .then(response => response.json())
                .then(data => {
                    const countryCode = data.countryCode; // F.eks. "NO" for Norge
                    userCountry = countryCode;
                    console.log("Brukerens land:", userCountry);
                })
                .catch(error => {
                    console.error('Feil ved henting av land:', error);
                });
        }
        , (error) => {
            console.error('Feil ved henting av posisjon:', error);
            userCountry = "NO"; // Sett en standardverdi hvis posisjon ikke kan hentes
        });
    }else{
        userCountry = "NO"; // Sett en standardverdi hvis geolokasjon ikke støttes
    }
}

function goToObjectShareKey() {
    // Sjekk om det foreligger noen nøkler i URL
    const keys = getQueryParams();

    // Sjekk om "page" er definert
    if (!keys?.page) {
        return;
    }

    // Håndtering for "team"
    if (keys.page === "team") {
        if (keys.tournamentid && keys.teamid) {
            // Last turneringen
            loadTourment(keys.tournamentid);

            // Naviger til "Turnering" tab
            document.getElementById("tabtoturnering").click()
            
            // Trykk på tabellknappen
            setTimeout(() => {
                document.getElementById("tabeltabbutton").click()
            }, 900);
            
            // Finn laget basert på "teamid"
            const team = teams.find(item => item.airtable === keys.teamid);

            // Vis laget dersom det finnes
            if (team) {
                setTimeout(() => {
                    viewteam(team);
                }, 1000);
                
            } else {
                console.error("Team ikke funnet for teamid:", keys.teamid);
            }
        } else {
            console.error("Mangler tournamentid eller teamid i URL-en.");
        }
    }
    // Håndtering for "match"
    else if (keys.page === "match") {
        if (keys.tournamentid && keys.matchid) {
            // Last turneringen
            loadTourment(keys.tournamentid);

            // Naviger til "Turnering" tab
            document.getElementById("tabtoturnering").click();

            // Trykk på kampknappen
            
              // Trykk på tabellknappen
              setTimeout(() => {
                document.getElementById("matchtabbutton").click();
            }, 900);

            // Finn kampen basert på "matchid"
            const match = matches.find(item => item.airtable === keys.matchid);

            // Vis kampen dersom den finnes
            if (match) {
                setTimeout(() => {
                    viewMatch(match);
                }, 1000);
                
            } else {
                console.error("Match ikke funnet for matchid:", keys.matchid);
            }
        } else {
            console.error("Mangler tournamentid eller matchid i URL-en.");
        }
    }
    // Håndtering for "tournament"
    else if (keys.page === "tournament") {
        if (keys.tournamentid) {
            // Last turneringen
            loadTourment(keys.tournamentid);
            if(keys.divisionid){
                //klikk på divisjonsknappen
                let divbuttonid = "di" + keys.divisionid;
                document.getElementById(divbuttonid).click();
            }
        } else {
            console.error("Mangler tournamentid i URL-en.");
        }
    } else {
        console.error(`Ukjent page-verdi: ${keys.page}`);
    }
}

function emtyTurnamentLists(){

    document.getElementById("teamslistholder").replaceChildren();
    document.getElementById("matchlistholder").replaceChildren(); 

}

function updateThisTournament(list){
    //trigges fra oppdatering internt i listene
    GETairtable(baseId,"tblGhVlhWETNvhrWN",activetournament.airtable,"responseThisTournament",true);
    //kopier loading holder i toppen av listen
    const nodeelement = document.getElementById("elementlibrary").querySelector(".loadingholder");

    //sette på loader animation
    if(list){
        const loadingelement = nodeelement.cloneNode(true);
        list.prepend(loadingelement);
    }else{
        const loadingelement1 = nodeelement.cloneNode(true);
        document.getElementById("teamslistholder").prepend(loadingelement1);

        const loadingelement2 = nodeelement.cloneNode(true);
        document.getElementById("matchlistholder").prepend(loadingelement2);

        const loadingelement3 = nodeelement.cloneNode(true);
        document.getElementById("endplaylist").prepend(loadingelement3);
    }
}

function responseThisTournament(data){
    activetournament = data.fields;
    // Finn turneringen i tournament-arrayen
    const tournamentIndex = tournament.findIndex(
        (thistournament) => thistournament.airtable === activetournament.airtable
    );
    if (tournamentIndex !== -1) {
        // Oppdater turneringen i arrayen
        tournament[tournamentIndex] = { ...tournament[tournamentIndex], ...activetournament };
        console.log("Tournament oppdatert:", tournament[tournamentIndex]);
    } else {
        console.warn("Turneringen ble ikke funnet i arrayen.");
    }

    //sjekker om det er en aktive divisjonsfilter
    let updateDivisjonsfilter = false;
    let activDivisjon;
    if(lastClickedDivisionButton){
        //det er et aktivt divisjonsfilter trykk på kanppen etter opplisting
        updateDivisjonsfilter = true;
        activDivisjon = lastClickedDivisionButton
    }
    


    loadTourmentHeader(activetournament);
    listDivision(activetournament);
    loadeLists(activetournament);
    isInTurnament = true;

     //aktiver filter igjen
     if(updateDivisjonsfilter){
        let buttonid = "di" + activDivisjon;
        document.getElementById(buttonid).click();
        lastClickedDivisionButton = activDivisjon;
    }
}

function loadTourment(tournamentid){
    //trigges fra listen på forsiden
    // Finn turneringen i "tournaments" arrayen basert på airtable feltet
    const data = tournament.find(thistournament => thistournament.airtable === tournamentid);

    if (!data) {
        console.warn(`Turneringen med ID ${tournamentid} ble ikke funnet.`);
        return; // Stopp funksjonen hvis turneringen ikke finnes
    }

    // Oppdater maxGoalDiff med tallverdi, eller bruk 100 som fallback
    maxGoalDiff = Number(data?.maxgoaldiff) || 100;


    //for å gå videre i tab systemet
    document.getElementById('tabtoturnering').click();
    //start match window
    document.getElementById('matchtabbutton').click();

    //hente ut aktuelle dager for filteret og laste det
    loadDayfilter(makeObjectFromAirtableJSON(data, "matchjson"));

     //tømfilter
     activeDayFilter = "";
     //activeMatchlistFilter = "";
     resetMatchlistFilter();

    activetournament = data
    loadTourmentHeader(data);
    listDivision(data);
    loadeLists(data);
    isInTurnament = true;

    // Kjør funksjonen etter 1 sekund
    setTimeout(adjustSwipeContainer, 500);
}
// Juster på nytt hvis størrelsen endres (valgfritt)
window.addEventListener("resize", adjustSwipeContainer);

function adjustSwipeContainer() {
    const headerWrapper = document.getElementById("headerwrapper");
    const swipeContainer = document.getElementById("swipe-container");

    if (headerWrapper && swipeContainer) {
        const headerHeight = headerWrapper.offsetHeight; // Hent høyden på headerwrapper
        
        // Beregn total padding-top
        const paddingTop = headerHeight;

        // Sett padding-top som utregnet verdi
        swipeContainer.style.paddingTop = `${paddingTop}px`;
    }
}

function loadeLists(data){

    let matCh = makeObjectFromAirtableJSON(data, "matchjson");
    //regne ut verdier om det er settverdier
    matCh = calculateMatchResultBySett(matCh);

    //regne ut resultat og utvisningsminutter fra loggen
    matCh = calculateMatchResultByLog(matCh);
    matches = matCh;

    if(matCh){listmatch(matCh,"dato",true);}

    teams = makeObjectFromAirtableJSON(data, "teamjson");
    if(teams){listteams(teams);}
    
    //list sluttspill
    endplay = endplayConverter(data);
    if(endplay){
       let endPlayExist = listendplay(matches,endplay);
       const endplaytabbutton = document.getElementById("endplaytabbutton");
        if(!endPlayExist){
             // Skjul sluttspill-fanen  
        endplaytabbutton.style.display = "none";
        }else {
            // Slå på
            endplaytabbutton.style.display = "inline-block";
        }
    }

    //om denne turneringen skal ha statistikk så slå den på
    const statisticstabbutton = document.getElementById("statisticstabbutton");
    statisticstabbutton.style.display = "none";
    if (data.statistics) {
        // Slå på statistikk-fanen
       statisticstabbutton.style.display = "inline-block";
    // Samle alle matchlogg-data i én liste
        let allMatchLogs = [];
    
        matches.forEach(match => {
            if (match.matchlogg && Array.isArray(match.matchlogg)) {
                allMatchLogs = allMatchLogs.concat(match.matchlogg);
            }
        });

        // Opprett spillerstatistikk
        if (allMatchLogs.length === 0) {
    
            // Tøm spillerstatistikk-listen
            const list = document.getElementById("statisticslistcontent");
            list.replaceChildren();
            //skriv dette  <h2>Statistics</h2>
            //  <p>Her vises listen over statistikk.</p>
            const emptyMessage = document.createElement("div");
            emptyMessage.innerHTML = `<h2>Ingen logg registrert</h2><p>Ingen mål eller assist registrert enda.</p>`;
            list.appendChild(emptyMessage);

        }else{
    
        PlayerStats = summarizePlayerStats(allMatchLogs);
        listPlayerStats(PlayerStats);
        }

        
    }else
    {
        // Skjul statistikk-fanen
        statisticstabbutton.style.display = "none";
        // Tøm spillerstatistikk-listen
        const list = document.getElementById("statisticslistcontent");
        list.replaceChildren();
        //skriv dette  <h2>Statistics</h2>
          //  <p>Her vises listen over statistikk.</p>
        const emptyMessage = document.createElement("div");
        emptyMessage.innerHTML = `<h2>Ingen statistikk tilgjengelig</h2><p>Ingen statistikk tilgjengelig for denne turneringen.</p>`;
        list.appendChild(emptyMessage);
    }

}

document.getElementById("playerSearch").addEventListener("input", function () {
    listPlayerStats(PlayerStats);
});

function listPlayerStats(data) {
    const activeDivision = getActiveDivisionFilter();
  
    // Filtrer basert på aktiv divisjon
    let filteredDivision = activeDivision === ""
      ? data
      : data.filter(player => player.divisionid === activeDivision);
  

    // Sorter på mål, assist eller samlet
    filteredDivision = filteredTypeStats(filteredDivision);
 
    // 🔍 Søkefilter på navn og nummer
    const searchValue = document.getElementById("playerSearch").value.toLowerCase().trim();
    if (searchValue !== "") {
    filteredDivision = filteredDivision.filter(player => {
        const name = (player.playername || "").toLowerCase();
        const number = (player.playnumber || "").toString();
        return name.includes(searchValue) || number.includes(searchValue);
    });
    }
  
    const list = document.getElementById("statisticslistcontent");
    list.replaceChildren();
  
    const elementlibrary = document.getElementById("elementlibrary");
    const groupHolder = elementlibrary.querySelector('.playerstats');
    const groupHoldercopy = groupHolder.cloneNode(true);
    groupHoldercopy.style.display = "block";
  
    // Sett overskrift
    const groupheadername = groupHoldercopy.querySelector('.groupheadername');
    let groupnameText = activeDivision === ""
      ? "Alle spillere"
      : `Spillere i ${activetournament.divisionname[
          activetournament.division.findIndex(item => item === activeDivision)
        ] || "Ukjent divisjon"}`;
    groupheadername.textContent = groupnameText;
  
    // Antall spillere
    const countplayers = groupHoldercopy.querySelector('.countplayers');
    countplayers.textContent = `${filteredDivision.length} stk. spillere`;
  
    list.appendChild(groupHoldercopy);
  
    const nodeelement = groupHoldercopy.querySelector('.resultrow');
  
    filteredDivision.forEach((item, i) => {
      const rowelement = nodeelement.cloneNode(true);
      rowelement.querySelector(".rangenr").textContent = item.rangenr + ".";
      rowelement.querySelector(".playername").textContent = item.playername || "";
      rowelement.querySelector(".goals").textContent = item.goals || 0;
      rowelement.querySelector(".assists").textContent = item.assists || 0;
      rowelement.querySelector(".teamlable").textContent = item.teamname || "";
      rowelement.querySelector(".divisjonlable").textContent = item.divisionname || "";
      rowelement.querySelector(".clubblable").textContent = item.club || "";
      nodeelement.parentElement.appendChild(rowelement);

      // Legg til klikkhendelse for å vise laget
        rowelement.addEventListener("click", () => {
            const team = teams.find(t => t.airtable === item.teamid);
            if (team) {
                viewteam(team);
                previouspage = "";
            } else {
                console.warn("Laget ble ikke funnet for spiller:", item.playerId);
            }
        });
    });
  
    nodeelement.remove();
}
  
function summarizePlayerStats(allMatchLogs) {
    const playerStats = {};

    allMatchLogs.forEach(log => {
        const playerId = log.player;
        if (!playerId) return;

        if (!playerStats[playerId]) {
            playerStats[playerId] = {
                playerId: playerId,
                playername: log.playername || "",
                teamname: log.teamname || "",
                teamid: log.team || "",
                club: log.club || "",
                divisionid: log.divisionid || "",
                divisionname: log.divisionname || "",
                goals: 0,
                assists: 0,
                penaltyMinutes: 0,
                events: 0
            };
        }

        // Tell antall hendelser
        playerStats[playerId].events += 1;

        // Mål
        if (log.eventtypelable === "Mål") {
            playerStats[playerId].goals += 1;
        }

        // Assists
        if (log.assistplayer && log.assistplayer !== "") {
            const assistId = log.assistplayer;
            if (!playerStats[assistId]) {
                playerStats[assistId] = {
                    playerId: assistId,
                    playername: log.assistplayername || "",
                    club: log.assistclub || "",          // Hvis du har assistklubb
                    divisionid: log.divisionid || "",
                    divisionname: log.divisionname || "", 
                    teamname: log.teamname || "",       // Antatt samme divisjon
                    teamid: log.team || "",
                    goals: 0,
                    assists: 0,
                    penaltyMinutes: 0,
                    events: 0
                };
            }
            playerStats[assistId].assists += 1;
            playerStats[assistId].events += 1;
        }

        // Utvisningsminutter
        if (log.penaltyminutes && !isNaN(Number(log.penaltyminutes))) {
            playerStats[playerId].penaltyMinutes += Number(log.penaltyminutes);
        }
    });

    // Returner som array
    return Object.values(playerStats);
}

function loadTourmentHeader(data){

    const headerholder = document.getElementById("tourmentheader");
    
    const icon = headerholder.querySelector(".tourmenticon");
    if(data.icon){
    icon.removeAttribute('srcset');
    icon.src = data.icon;
    }
    const name = headerholder.querySelector(".tourmentlable");
    name.textContent = data.name;
    
    const date = headerholder.querySelector(".datename");
    date.textContent = formatDate(data.startdate);
    
}

function listDivision(tournament) {
    const list = document.getElementById("divisionholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.divisionbutton');

    let divisionArray = makeDivisionArray(tournament);

    for (let item of divisionArray) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.id = "di" + item.airtable;
        rowelement.textContent = item.name;

        // Bruk `handleDivisionButtonClick` som klikkhåndterer
        rowelement.onclick = () => handleDivisionButtonClick(item);

        // Sett standard stil for første knapp
        if (item === divisionArray[0]) {
            lastClickedDivisionButton = item.airtable; // Sett første knapp som aktiv ved start
            rowelement.style.backgroundColor = mapColors("hoverelement");
            rowelement.style.borderColor = mapColors("border");
        }

        list.appendChild(rowelement);
    }
}

function makeDivisionArray(tournament){
    let divisionArray = [];
    if(tournament?.division){
        //har division
        for(var i = 0;i<tournament.division.length;i++){
            divisionArray.push({name:tournament.divisionname[i],airtable:tournament.division[i]});
        }
        divisionArray = sortArrayABC(divisionArray,"name");
        divisionArray.unshift({
            name: "Alle",
            airtable: ""
        });
    }
  
    return divisionArray;
}

// Global variabel for å holde styr på siste trykte knapp
let lastClickedDivisionButton = "";

// Funksjon som settes som onclick-håndterer for divisjonsknappene
function handleDivisionButtonClick(item) {
    // Oppdater `lastClickedDivisionButton` med ID-en til den trykte knappen
    lastClickedDivisionButton = item.airtable;

    // Oppdater stil for knapper (valgfritt, for å vise aktiv knapp visuelt)
    const buttonlist = document.getElementById("divisionholder");
    Array.from(buttonlist.children).forEach(element => {
        if (element.id === "di" + lastClickedDivisionButton) {
            element.style.backgroundColor = mapColors("hoverelement");
            element.style.borderColor = mapColors("border");
        } else {
            element.style.backgroundColor = mapColors("hoverelement");
            element.style.borderColor = "transparent";
        }
    });

    // Oppdater kamp- og lagvisninger
    listmatch(matches, "dato",false);
    listteams(teams);
    listendplay(matches,endplay);
    listPlayerStats(PlayerStats);
}

// Funksjon for å hente ID-en til aktivt filter
function getActiveDivisionFilter() {
    return lastClickedDivisionButton || ""; // Returner aktivt filter eller tom streng hvis ingen knapp er trykket
}

function initStatisticsFilter() {
    // Finn "statisticfilterconteiner" i elementlibrary og flytt det inn i statisticsfiltercontainer
    const statisticsFilterContainerNode = document.getElementById("statisticfilterconteinerelement");
    const statisticFilterContainer = document.getElementById("statisticslist");

    if (statisticFilterContainer && statisticsFilterContainerNode) {
        // Legg den inn som første barn i containeren
        statisticFilterContainer.prepend(statisticsFilterContainerNode);



        //lag en klikkhendelse for filterknappene
        const filterButtons = statisticsFilterContainerNode.querySelectorAll(".statisticfilterbutton");
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                // Fjern "active" klasse fra alle knapper
                filterButtons.forEach(btn => btn.classList.remove("active"));
                
                // Legg til "active" klasse på den trykte knappen
                button.classList.add("active");
                
                // Oppdater spillerstatistikk basert på valgt filter
                listPlayerStats(PlayerStats);
            });
        });



    }
}

function filteredTypeStats(players) {
    const statisticsFilterContainerNode = document.getElementById("statisticfilterconteinerelement");
    const activeFilter = Array.from(statisticsFilterContainerNode.children).find(child => child.classList.contains("active"));

    let filteredPlayers;
    let sortFunction;
    let isSameFunction;

    if (!activeFilter || activeFilter.id === "totalStats") {
        sortFunction = (a, b) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.playername.localeCompare(b.playername);
        };
        isSameFunction = (a, b) => a.goals === b.goals && a.assists === b.assists;

        filteredPlayers = players.slice().sort(sortFunction);
    } else if (activeFilter.id === "goalsfilterStats") {
        filteredPlayers = players
            .filter(player => player.goals > 0)
            .sort((a, b) => {
                if (b.goals !== a.goals) return b.goals - a.goals;
                if (b.assists !== a.assists) return b.assists - a.assists;
                return a.playername.localeCompare(b.playername);
            });

        sortFunction = (a, b) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.playername.localeCompare(b.playername);
        };
        isSameFunction = (a, b) => a.goals === b.goals && a.assists === b.assists;
    } else if (activeFilter.id === "assistfilterStats") {
        filteredPlayers = players
            .filter(player => player.assists > 0)
            .sort((a, b) => {
                if (b.assists !== a.assists) return b.assists - a.assists;
                if (b.goals !== a.goals) return b.goals - a.goals;
                return a.playername.localeCompare(b.playername);
            });

        sortFunction = (a, b) => {
            if (b.assists !== a.assists) return b.assists - a.assists;
            if (b.goals !== a.goals) return b.goals - a.goals;
            return a.playername.localeCompare(b.playername);
        };
        isSameFunction = (a, b) => a.assists === b.assists && a.goals === b.goals;
    } else {
        return [];
    }

    // --- Rangering ---
    let currentRank = 1;
    let previous = null;
    let groupStartIndex = 0;

    for (let i = 0; i < filteredPlayers.length; i++) {
        const current = filteredPlayers[i];
        const isSameAsPrevious = previous && isSameFunction(current, previous);

        if (!isSameAsPrevious) {
            const groupSize = i - groupStartIndex;
            if (groupSize === 1) {
                filteredPlayers[groupStartIndex].rangenr = `${currentRank}`;
            } else {
                for (let j = groupStartIndex; j < i; j++) {
                    filteredPlayers[j].rangenr = `(${currentRank})`;
                }
            }

            groupStartIndex = i;
            currentRank = i + 1;
        }

        previous = current;
    }

    // Siste gruppe
    const groupSize = filteredPlayers.length - groupStartIndex;
    if (groupSize === 1) {
        filteredPlayers[groupStartIndex].rangenr = `${currentRank}`;
    } else {
        for (let j = groupStartIndex; j < filteredPlayers.length; j++) {
            filteredPlayers[j].rangenr = `(${currentRank})`;
        }
    }

    return filteredPlayers;
}




