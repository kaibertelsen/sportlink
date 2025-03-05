function listTournament(tournament) {
    const list = document.getElementById("maintournamentlist");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.turneringholder');

    for (let item of tournament) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.dataset.sport = item.sport[0];
        rowelement.dataset.organizer = item.organizer[0];
        rowelement.onclick = function() {
            loadTourment(item.airtable);
        };

        const nameelement = rowelement.querySelector(".turnname");
        nameelement.textContent = item.name;

        const dateelement = rowelement.querySelector(".datename");
        const startDate = new Date(item.startdate);
        dateelement.textContent = startDate.toLocaleDateString("no-NO", {
            day: "2-digit",
            month: "short"
        }).replace('.', ''); // Fjerner punktum fra måneden

        const iconelement = rowelement.querySelector(".turnicon");
        if(item.icon){
        iconelement.removeAttribute('srcset');
        iconelement.src = item.icon;
        }
        const iconsportelement = rowelement.querySelector(".sporticon");
        iconsportelement.removeAttribute('srcset');
        iconsportelement.src = item.sporticon[0];

        const statuslableelement = rowelement.querySelector(".sattuslable");

        if (isDatePassed(item.startdate)) {
            if (item?.enddate && isDatePassed(item.enddate)) {
                statuslableelement.textContent = "Er avsluttet!";
                statuslableelement.style.color = mapColors("textoff");
            } else {
                statuslableelement.textContent = "Spilles nå!";
                statuslableelement.style.color = mapColors("main");
            }
        } else {
            // Start en live nedtelling til startdatoen
            function updateCountdown() {
                const now = new Date();
                const timeDiff = startDate - now;

                if (timeDiff <= 0) {
                    statuslableelement.textContent = "Starter nå!";
                    statuslableelement.style.color = mapColors("main");
                    clearInterval(countdownInterval); // Stopp nedtelling når datoen er nådd
                    return;
                }

                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                // Formater tid med to sifre
                const formatTwoDigits = (number) => number.toString().padStart(2, '0');

                statuslableelement.textContent = `${formatTwoDigits(days)}d ${formatTwoDigits(hours)}t ${formatTwoDigits(minutes)}m ${formatTwoDigits(seconds)}s`;
            }

            updateCountdown(); // Kjør første oppdatering umiddelbart
            const countdownInterval = setInterval(updateCountdown, 1000); // Oppdater hvert sekund
        }

        list.appendChild(rowelement);
    }
}

function listSports(tournament) {
    const list = document.getElementById("sportlist");
    const elementLibrary = document.getElementById("elementlibrary");
    const nodeElement = elementLibrary.querySelector('.turnfilterbutton');
    const sports = findeunicSport(tournament);

    // Tøm eksisterende liste før ny oppbygging
    list.innerHTML = "";

    for (let item of sports) {
        // Lag en kopi av mal-elementet
        const rowElement = nodeElement.cloneNode(true);
        rowElement.id = "fi" + item.sport;

        // Definer klikk-funksjonen for filter
        rowElement.onclick = function () {
            activeSportType = item.sport;
            filterTournamentList(rowElement);
        };

        // Oppdater innholdet i elementet
        const nameElement = rowElement.querySelector(".sportlable");
        nameElement.textContent = item.sportname;

        const iconSportElement = rowElement.querySelector(".sporticon");
        iconSportElement.removeAttribute('srcset');

        // Sett ikon eller fjern hvis sportIcon er tom
        if (item.sporticon !== "") {
            iconSportElement.src = item.sporticon;
        } else {
            iconSportElement.remove();
        }

        // Marker første element som aktivt
        if (item === sports[0]) {
            rowElement.style.borderColor = mapColors("border");
        }

        // Legg til elementet i listen
        list.appendChild(rowElement);
    }
}

function listOrganizer(tournament) {
    const list = document.getElementById("organizerlist");
    const elementLibrary = document.getElementById("elementlibrary");
    const nodeElement = elementLibrary.querySelector('.turnfilterbutton');
    const organizerList = findeunicOrganizer(tournament);

    // Tøm eksisterende liste før ny oppbygging
    list.innerHTML = "";

    //sotere


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
            organizername: event.organizername[0],
            organizerend: event.organizerend[0] || ""
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