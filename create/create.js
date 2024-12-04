
function startCreateTurnament(){

getOrganizerlist(clientID);
getSportlist();
startCreateTurnamentWrapper();
}

function getOrganizerlist(klientid){

    var body = airtablebodylistAND({klientid:klientid,archived:0});
    Getlistairtable(baseId,"tbl4bHhV4Bnbz8I3r",body,"responseOrganizerlist");

}


function getSportlist(){

    var body = airtablebodylistAND({section:1});
    Getlistairtable(baseId,"tbl2FRAzV1Ze5DdYh",body,"responseSportlist");

}

function responseSportlist(data) {
    // Rens rådata
    const sportlist = rawdatacleaner(data);
    SportList = sportlist; // Global variabel for videre bruk

    // Hent selector-elementet med klassen 'sportselector' innenfor 'activecontainerturnament'
    const activeContainer = document.getElementById("activecontainerturnament");

    const sportSelector = activeContainer.querySelector(".sportselector");


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

    console.log("Sportlist oppdatert:", sportlist);
}


function responseOrganizerlist(data) {
    // Rens rådata
    const organizers = rawdatacleaner(data);
    orgaNizer = organizers; // Global variabel for videre bruk

    // Hent holder-elementet med id 'activecontainerturnament'
    const activeContainer = document.getElementById("activecontainerturnament");


    // Hent selector-elementet med klassen 'organizerselector' innenfor holderen
    const organizerSelector = activeContainer.querySelector(".organizerselector");

    // Tøm tidligere alternativer
    organizerSelector.innerHTML = "";

    // Legg til en standard "Velg arrangement" option
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

    console.log("Organizerlist oppdatert:", organizers);
}


function startCreateTurnamentWrapper() {
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
        clonedElement.id = "activecontainerturnament"; // Nytt ID for klonede elementer
        clonedElement.classList.add('cloned-turnament-holder'); // Unik klasse for enklere identifikasjon

        // Legg det klonede elementet øverst i containeren
        containerTurnament.insertBefore(clonedElement, containerTurnament.firstChild);

        // Koble "Opprett turnering"-knappen til `saveNewTurnament`
        const opprettButton = clonedElement.querySelector('.opprettbutton');
        if (opprettButton) {
            opprettButton.onclick = function (event) {
                event.preventDefault();
                saveNewTurnament(clonedElement);
            };
        }
    }
}



function saveNewTurnament(wrapperelement) {
    // Hent verdier fra inputfeltene
    const name = wrapperelement.querySelector('.inputname')?.value.trim() || "";
    const startdate = wrapperelement.querySelector('.startdate')?.value || "";
    const enddate = wrapperelement.querySelector('.enddate')?.value || "";
    const sportSelector = wrapperelement.querySelector('.sportselector');
    const sport = sportSelector?.value ? [sportSelector.value] : [];
    const organizerSelector = wrapperelement.querySelector('.organizerselector');
    const organizer = organizerSelector?.value ? [organizerSelector.value] : [];
    const icon = wrapperelement.querySelector('#icon-upload')?.value || ""; // Hent URL for ikonet

    // Generer et nytt turneringsobjekt
    const newTournament = {
        name: name,
        startdate: startdate,
        enddate: enddate,
        sport: sport,
        organizer: organizer,
        icon: icon
    };

    // Sjekk om alle påkrevde felt er fylt ut
    if (!name || !startdate || !enddate || sport.length === 0 || organizer.length === 0 || !icon) {
        alert("Vennligst fyll ut alle feltene og last opp et ikon.");
        return;
    }

    // Logg det opprettede objektet
    console.log("Nytt turneringsobjekt opprettet:", newTournament);

    // Send til serveren eller prosesser videre
    // saveTournamentToServer(newTournament);
}


