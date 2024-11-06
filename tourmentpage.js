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
    getMatch(data);
    console.log(data);
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
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.id = "di" + item.airtable;
        rowelement.textContent = item.name;

        // Angi klikkhåndtering for divisjonsknappen
        rowelement.onclick = function() {
            // Tilbakestill stil for alle knapper
            Array.from(list.children).forEach(element => {
                element.style.backgroundColor = "#1d1d1d";
                element.style.borderColor = "transparent";
            });

            // Angi aktiv stil for valgt knapp
            rowelement.style.backgroundColor = "#192219";
            rowelement.style.borderColor = "#61de6e";

            // Oppdater lister basert på valgt divisjon
            listmatch(matches, "dato"); // match er kampdataene
            listteams(teams); // teams er lagdataene
        };

        // Sett standard stil for første knapp
        if (item === divisionArray[0]) {
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
/*
function filterDevisiontype(item, match, teams) {
    const buttonlist = document.getElementById("divisionholder");
    if (!buttonlist) return; // Sjekk at elementet eksisterer

    // Oppdater stil for alle knapper til standard utseende
    Array.from(buttonlist.children).forEach(element => {
        element.style.backgroundColor = "#1d1d1d";
        element.style.borderColor = "transparent";
    });

    // Oppdater stilen for den valgte knappen
    let buttonid = "di" + item.airtable;
    const thisfilterbutton = document.getElementById(buttonid);
    if (thisfilterbutton) {
        thisfilterbutton.style.backgroundColor = "#192219";
        thisfilterbutton.style.borderColor = "#61de6e";
    }

    // Filtrer kamper
    if (document.getElementById("matchlistholder")) {
        let filteredMatches;
        if (item.airtable === "") {
            filteredMatches = match; // Vis alle kamper hvis "Alle" er valgt
        } else {
            filteredMatches = match.filter(thismatch => thismatch.division[0] === item.airtable);
        }
        listmatch(filteredMatches, "dato"); // Oppdater kamp-listen
    }

    // Filtrer lagtabellen
    if (document.getElementById("teamslistholder")) {
        let filteredTeams;
        if (item.airtable === "") {
            filteredTeams = teams; // Vis alle lag hvis "Alle" er valgt
        } else {
            filteredTeams = teams.filter(team => team.division[0] === item.airtable);
        }
        listteams(filteredTeams); // Oppdater lagtabellen
    }
}
*/
// Funksjon som finner aktiv filterknapp og returnerer valgt divisjon
function getActiveDivisionFilter() {
    const buttonlist = document.getElementById("divisionholder");
    if (!buttonlist) return ""; // Returner tom streng hvis elementet mangler

    // Finn den aktive knappen ved å sjekke stil eller andre indikatorer
    let activeDivision = "";
    Array.from(buttonlist.children).forEach(element => {
        if (element.style.backgroundColor === "#192219") { // Sjekk aktiv stil
            activeDivision = element.id.replace("di", ""); // Fjern "di" for å få airtable ID
        }
    });

    return activeDivision; // Returner den aktive divisjonens ID eller tom streng
}
