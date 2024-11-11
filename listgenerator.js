function listTournament(tournament){
    const list = document.getElementById("maintournamentlist");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.turneringholder');

    for (let item of tournament) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.dataset.sport = item.sport[0];
        rowelement.dataset.organizer = item.organizer[0];
        rowelement.onclick = function() {
            loadTourment(item);
        }

        const nameelement = rowelement.querySelector(".turnname");
        nameelement.textContent = item.name;

        const dateelement = rowelement.querySelector(".datename");
        dateelement.textContent = formatDate(item.startdate);

        const iconelement = rowelement.querySelector(".turnicon");
        iconelement.removeAttribute('srcset');
        iconelement.src = item.icon;

        const iconsportelement = rowelement.querySelector(".sporticon");
        iconsportelement.removeAttribute('srcset');
        iconsportelement.src = item.sporticon[0];
        
        const statuslableelement = rowelement.querySelector(".sattuslable");
        if(isDatePassed(item.startdate)){
                if(item?.enddate && isDatePassed(item.enddate)){
                    statuslableelement.textContent = "Er avsluttet!";
                    statuslableelement.style.color = mapColors("textoff");
                }else{
                    statuslableelement.textContent = "Spilles nå!";
                    statuslableelement.style.color = mapColors("main");
                }
        }else{
        statuslableelement.textContent = statusDatetoplay(item.startdate);
        }
        
        list.appendChild(rowelement);
      }

}

function listSports(tournament){
    const list = document.getElementById("sportlist");
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.turnfilterbutton');
    let sports = findeunicSport(tournament);
    

    for (let item of sports) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.id = "fi"+item.sport;

        rowelement.onclick = function() {
            activesporttype = item.sport;
            filterTournamentList(rowElement);
        }

        const nameelement = rowelement.querySelector(".sportlable");
        nameelement.textContent = item.sportname;
        
        const iconsportelement = rowelement.querySelector(".sporticon");
        iconsportelement.removeAttribute('srcset');
        if(item.sporticon != ""){
        iconsportelement.src = item.sporticon;
        }else{
            iconsportelement.remove(); 
        }
        
        if (item === sports[0]) {
           
            //rowelement.style.backgroundColor = mapColors("elementactive");
            rowelement.style.borderColor = mapColors("border");
        }




        list.appendChild(rowelement);
    }



}

function listOrganizer(tournament) {
    const list = document.getElementById("organizerlist");
    const elementLibrary = document.getElementById("elementlibrary");
    const nodeElement = elementLibrary.querySelector('.turnfilterbutton');
    const organizerList = findeunicOrganizer(tournament);

    // Tøm eksisterende liste før ny oppbygging
    list.innerHTML = "";

    for (let item of organizerList) {
        // Lag en kopi av mal-elementet
        const rowElement = nodeElement.cloneNode(true);
        rowElement.id = "org" + item.organizer;

        // Definer klikk-funksjonen for filter
        rowElement.onclick = function () {
            activeOrganizer = item.organizer;
            filterTournamentList(rowElement);
        };

        // Oppdater innholdet i elementet
        const nameElement = rowElement.querySelector(".sportlable");
        nameElement.textContent = item.organizername;

        const iconSportElement = rowElement.querySelector(".sporticon");
        iconSportElement.removeAttribute('srcset');

        // Sett ikon eller fjern hvis organizer er tom
        if (item.organizer !== "") {
            iconSportElement.src = item.organizer;
        } else {
            iconSportElement.remove();
        }

        // Marker første element som aktivt
        if (item === organizerList[0]) {
            rowElement.style.borderColor = mapColors("border");
        }

        // Legg til elementet i listen
        list.appendChild(rowElement);
    }
}




function filterTournamentList(button) {
    // Få alle knappene i foreldre-elementet og sett standardstil
    const allButtons = Array.from(button.parentElement.children);
    allButtons.forEach((element) => {
        element.style.backgroundColor = mapColors("blueblack");
        element.style.borderColor = "transparent";
    });

    // Marker valgt knapp
    button.style.borderColor = mapColors("border");

    // Hent listen over turneringer
    const list = document.getElementById("maintournamentlist");
    const allElements = Array.from(list.children);

    // Gå gjennom alle elementene i listen og filtrer
    allElements.forEach((element) => {
        const elementSport = element.dataset.sport || "";
        const elementOrganizer = element.dataset.organizer || "";

        // Hent aktive verdier (sjekk om de er definert først)
        const matchesSport = typeof activeSportType === "undefined" || !activeSportType || elementSport === activeSportType;
        const matchesOrganizer = typeof activeOrganizer === "undefined" || !activeOrganizer || elementOrganizer === activeOrganizer;

        // Oppdater visningen basert på filterkriteriene
        if (matchesSport && matchesOrganizer) {
            element.style.display = "grid";
        } else {
            element.style.display = "none";
        }
    });
}




function filterSporttype(item){

     const buttonlist = document.getElementById("sportlist");
     let allButtons =  buttonlist.children;
     
     allButtons.forEach(element => {
        //sett standard verdien
        element.style.backgroundColor = mapColors("blueblack");
        element.style.borderColor = "transparent";
     });
     
     let buttonid = "fi"+item.sport;
     const thisfilterbutton = document.getElementById(buttonid);

     if(thisfilterbutton){
     // thisfilterbutton.style.backgroundColor = mapColors("elementactive");
       thisfilterbutton.style.borderColor = mapColors("border");
     }

    const list = document.getElementById("maintournamentlist");
    let typesport = item.sport;
    let allElements =  list.children;
    // Gå gjennom alle elementene og logg dem til konsollen
    allElements.forEach(element => {
       if(element.dataset?.sport && element.dataset.sport == typesport){
        element.style.display = "grid";
       }else if(typesport == ""){
       element.style.display = "grid";
       }else{
        element.style.display = "none";
       }
  });
}

function findeunicSport(Array){
    // Ny array for unike sportsverdier
    let uniqueSportsArray = [];

    // Funksjon for å finne unike sport, sportname og sporticon
    Array.forEach(event => {
    // Sjekk om sport allerede finnes i den nye arrayen
    let exists = uniqueSportsArray.some(sportObj => sportObj.sport === event.sport[0]);

    // Hvis det ikke finnes, legg det til
    if (!exists) {
        uniqueSportsArray.push({
        sport: event.sport[0],
        sportname: event.sportname[0],
        sporticon: event.sporticon[0]
        });
    }
    });

    uniqueSportsArray = sortArrayABC(uniqueSportsArray,"sportname");
        uniqueSportsArray.unshift({
            sport: "",
            sportname: "Alle",
            sporticon: ""});

    return uniqueSportsArray;
}

function findeunicOrganizer(Array){
    // Ny array for unike sportsverdier
    let uniqueOrganizerArray = [];

    // Funksjon for å finne unike sport, sportname og sporticon
    Array.forEach(event => {
    // Sjekk om organizer allerede finnes i den nye arrayen
    let exists = uniqueOrganizerArray.some(orgObj => orgObj.organizer === event.organizer[0]);

    // Hvis det ikke finnes, legg det til
    if (!exists) {
        uniqueOrganizerArray.push({
            organizer: event.organizer[0],
            organizername: event.organizername[0]
        });
    }
    });

    uniqueOrganizerArray = sortArrayABC(uniqueOrganizerArray,"organizername");
    uniqueOrganizerArray.unshift({
            organizer: "",
            organizername: "Alle"
        });
    return uniqueOrganizerArray
        
}