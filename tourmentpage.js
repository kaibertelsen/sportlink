function getTournament(klientid) {
    var body = airtablebodylistAND({klientid:klientid,archived:0});
    Getlistairtable(baseId,"tblGhVlhWETNvhrWN",body,"getTournamentresponse");
}

function getTournamentresponse(data){
    tournament = rawdatacleaner(data);
    //lag filter
    listSports(tournament);
    //sorter på dato
    listTournament(sortDateArray(tournament,"startdate"));


}



function loadTourment(data){
    //for å gå videre i tab systemet
    document.getElementById('tabtoturnering').click();
    activetournament = data
    loadTourmentHeader(data);
    listDivision(data);
    //lagrer lagdata fra tournament
    teams = makeObjectFromAirtableJSON(data, "teamjson");
    matches = makeObjectFromAirtableJSON(data, "matchjson");
    listmatch(matches,"dato");
}

function loadTourmentHeader(data){

    const headerholder = document.getElementById("tourmentheader");
    
    const icon = headerholder.querySelector(".tourmenticon");
    icon.removeAttribute('srcset');
    icon.src = data.icon;

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
            rowelement.style.backgroundColor = "#192219";
            rowelement.style.borderColor = "#61de6e";
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
            element.style.backgroundColor = "#192219";
            element.style.borderColor = "#61de6e";
        } else {
            element.style.backgroundColor = "#1d1d1d";
            element.style.borderColor = "transparent";
        }
    });

    // Oppdater kamp- og lagvisninger
    listmatch(matches, "dato");
    listteams(teams);
}

// Funksjon for å hente ID-en til aktivt filter
function getActiveDivisionFilter() {
    return lastClickedDivisionButton || ""; // Returner aktivt filter eller tom streng hvis ingen knapp er trykket
}







