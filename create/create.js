
function startCreateTurnament(){

getOrganizerlist(clientID);
getSportlist(clientID);
startCreateTurnamentWrapper();
}



function getOrganizerlist(klientid){

    var body = airtablebodylistAND({klientid:klientid,archived:0});
    Getlistairtable(baseId,"tbl4bHhV4Bnbz8I3r",body,"responseOrganizerlist");

}


function getSportlist(klientid){

    var body = airtablebodylistAND({klientid:klientid});
    Getlistairtable(baseId,"tbl2FRAzV1Ze5DdYh",body,"responseSportlist");

}

function responseSportlist(data) {
    // Rens rådata
    const sportlist = rawdatacleaner(data);
    SportList = sportlist; // Global variabel for videre bruk

    // Hent selector-elementet med id 'sport'
    const sportSelector = document.getElementById("sport");

    // Tøm tidligere alternativer
    sportSelector.innerHTML = "";

    // Legg til en standard "Velg sport" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Velg sport";
    sportSelector.appendChild(defaultOption);

    // Loop gjennom sportdata og legg til i selector
    sportlist.forEach(sport => {
        const option = document.createElement("option");
        option.value = sport.airtable; // Sett verdien til airtable-ID
        option.textContent = sport.name; // Sett teksten til sportens navn
        sportSelector.appendChild(option);
    });
}






function responseOrganizerlist(data) {
    // Rens rådata
    const organizers = rawdatacleaner(data);
    orgaNizer = organizers;
    // Hent selector-elementet med id 'organizer'
    const organizerSelector = document.getElementById("organizer");

    // Tøm tidligere alternativer
    organizerSelector.innerHTML = "";

    // Legg til en standard "Velg" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Velg arrangement";
    organizerSelector.appendChild(defaultOption);

    // Loop gjennom organisatørdata og legg til i selector
    organizers.forEach(organizer => {
        const option = document.createElement("option");
        option.value = organizer.airtable; // Sett verdien til airtable-ID
        option.textContent = organizer.name; // Sett teksten til organisatørens navn
        organizerSelector.appendChild(option);
    });
}





function startCreateTurnamentWrapper(){
    // Finn elementet som skal kopieres
    const createTurnamentHolder = document.getElementById('creatturnamentholder');
       
    if (!createTurnamentHolder) {
        console.warn('Element med id "creatturnamentholder" finnes ikke.');
        return;
    }
   
    // Finn containeren der elementet skal legges til
    const containerTurnament = document.getElementById('containerturnament');
    
    if (!containerTurnament) {
        console.warn('Element med id "containerturnament" finnes ikke.');
        return;
    }
   
    // Sjekk om elementet allerede er lagt til
    const existingElement = containerTurnament.querySelector('.cloned-turnament-holder');
   
    if (existingElement) {
        // Fjern det eksisterende elementet
        containerTurnament.removeChild(existingElement);
    } else {
        // Klon elementet
        const clonedElement = createTurnamentHolder.cloneNode(true);
   
        // Legg til en unik klasse for enklere identifikasjon
        clonedElement.classList.add('cloned-turnament-holder');
   
        // Legg det klonede elementet øverst i containeren
        containerTurnament.insertBefore(clonedElement, containerTurnament.firstChild);
    }
   
   
   
   
   }