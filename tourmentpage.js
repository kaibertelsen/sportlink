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
}
function goToObjectShareKey() {
    // Sjekk om det foreligger noen nøkler i URL
    const keys = getQueryParams();

    // Sjekk om "page" er definert
    if (!keys?.page) {
        console.error("Page-parameteren mangler i URL-en.");
        return;
    }

    // Håndtering for "team"
    if (keys.page === "team") {
        if (keys.tournamentid && keys.teamid) {
            // Last turneringen
            loadTourment(keys.tournamentid);

            // Naviger til "Turnering" tab
            document.getElementById("tabtoturnering").click();

            // Trykk på tabellknappen
            document.getElementById("tabeltabbutton").click();

            // Finn laget basert på "teamid"
            const team = teams.find(item => item.airtable === keys.teamid);

            // Vis laget dersom det finnes
            if (team) {
                viewteam(team);
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
            document.getElementById("matchtabbutton").click();

            // Finn kampen basert på "matchid"
            const match = matches.find(item => item.airtable === keys.matchid);

            // Vis kampen dersom den finnes
            if (match) {
                viewMatch(match);
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
    //for å gå videre i tab systemet
    document.getElementById('tabtoturnering').click();
    //start match window
    document.getElementById('matchtabbutton').click();

    activetournament = data
    loadTourmentHeader(data);
    listDivision(data);
    loadeLists(data);
    isInTurnament = true;

   // Kjør funksjonen etter 1 sekund
setTimeout(adjustSwipeContainer, 1000);
}
// Juster på nytt hvis størrelsen endres (valgfritt)
window.addEventListener("resize", adjustSwipeContainer);

function adjustSwipeContainer() {
    const headerWrapper = document.getElementById("headerwrapper");
    const swipeContainer = document.getElementById("swipe-container");
    const swipeContainerList = swipeContainer.querySelector(".swipe-container-list");

    if (headerWrapper && swipeContainerList) {
        const headerHeight = headerWrapper.offsetHeight; // Hent høyden på headerwrapper
        const safeAreaInsetTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0; // Hent safe area top, fallback til 0

        // Beregn total margin-top
        const marginTop = headerHeight + safeAreaInsetTop+10;

        // Sett margin-top som utregnet verdi
        swipeContainerList.style.marginTop = `${marginTop}px`;
    }
}

function loadeLists(data){
    matches = makeObjectFromAirtableJSON(data, "matchjson");
    if(matches){listmatch(matches,"dato",true);}

    teams = makeObjectFromAirtableJSON(data, "teamjson");
    if(teams){listteams(teams);}
    
    //list sluttspill
    endplay = endplayConverter(data);
    if(endplay){listendplay(matches,endplay);}

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
}

// Funksjon for å hente ID-en til aktivt filter
function getActiveDivisionFilter() {
    return lastClickedDivisionButton || ""; // Returner aktivt filter eller tom streng hvis ingen knapp er trykket
}

