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
function goToObjectShareKey(){

    //sjekk om det foreligger noen nøkler i url
    let keys = getQueryParams();

    if(keys?.teamid && keys?.tournamentid){
        //det er lag som er delt gå til lag
        
        loadTourment(keys.tournamentid);
        document.getElementById("tournamenttabbutton").click();
     
        //åpne lag
        let team = teams.find(item => item.airtable === keys.teamid);
        viewteam(team);
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

    loadTourmentHeader(activetournament);
    listDivision(activetournament);
    loadeLists(activetournament);
    isInTurnament = true;
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

