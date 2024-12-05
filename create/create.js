
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
    const activeContainer = document.getElementById("creatturnamentholder");

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

    // Sjekk om elementet med id 'creatturnamentholder' eksisterer
    const activeContainer = document.getElementById('creatturnamentholder');

    if (!activeContainer) {
        console.warn("Element med id 'creatturnamentholder' finnes ikke.");
        return;
    }

    // Hent selector-elementet med klassen 'organizerselector' innenfor holderen
    const organizerSelector = activeContainer.querySelector(".organizerselector");

    if (!organizerSelector) {
        console.warn("Selector-element med klassen 'organizerselector' finnes ikke.");
        return;
    }

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
    // Finn elementet som skal flyttes
    const creatturnamentholder = document.getElementById('creatturnamentholder');

    if (!creatturnamentholder) {
        console.warn('Element med id "creatturnamentholder" finnes ikke.');
        return;
    }

    // Finn containeren der elementet skal legges til
    const creatturnamentlist = document.getElementById('creatturnamentlist');

    if (!creatturnamentlist) {
        console.warn('Element med id "creatturnamentlist" finnes ikke.');
        return;
    }

    // Finn opprinnelig plassering (statisk definert)
    const elementlibrary = document.getElementById('elementlibrary');

    if (!elementlibrary) {
        console.warn('Element med id "elementlibrary" finnes ikke.');
        return;
    }

    // Sjekk hvor `creatturnamentholder` er
    if (creatturnamentlist.contains(creatturnamentholder)) {
        // Flytt tilbake til opprinnelig plassering
        elementlibrary.appendChild(creatturnamentholder);
    } else {
        // Flytt elementet til containeren
        creatturnamentlist.appendChild(creatturnamentholder);

        // Koble "Opprett turnering"-knappen til `saveNewTurnament`
        const opprettButton = creatturnamentholder.querySelector('.opprettbutton');
        if (opprettButton) {
            opprettButton.onclick = function (event) {
                event.preventDefault();
                saveNewTurnament(creatturnamentholder);
            };
        }
    }

    //uploader
    const ctx = document.querySelector('uc-upload-ctx-provider')
    ctx.addEventListener('done-click', e => {
     const uploadedFileInfo = e.detail; // Detaljer om det opplastede bildet
     const uploadedImage = uploadedFileInfo.cdnUrl; // Hent URL til bildet fra `cdnUrl`
  
      if (uploadedImage) {
      const imagepreview = document.querySelector('.uploadedtrunamentimagepreview');
          imagepreview.src = uploadedImage;
      imagepreview.style.display = "inline-block";
      document.querySelector('.uploadedtrunamentinput').value = uploadedImage;
      } else {
        console.warn('No cdnUrl found in file-upload-success event.');
      }
  
    });

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

    // Hent Uploadcare URL fra lr-data-output
    const uploaderInputvalue = document.querySelector('[name="my-uploader"]').value;

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

    console.log("Nytt turneringsobjekt opprettet:", newTournament);

    // Lagre objektet på serveren (eksempel)
    // saveTournamentToServer(newTournament);
}




