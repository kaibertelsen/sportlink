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

function listDivision(tournament){
    const list = document.getElementById("divisionholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.divisionbutton');
 
    let divisionArray = makeDivisionArray(tournament);
    
    for (let item of divisionArray) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.id = "di"+item.airtable;

        rowelement.onclick = function() {
            filterDevisiontype(item);
        }
        rowelement.textContent = item.name;
        
        if (item === divisionArray[0]) {
            rowelement.style.backgroundColor = "#192219";
            rowelement.style.borderColor = "#61de6e";
        }
        list.appendChild(rowelement);
    }
}

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



