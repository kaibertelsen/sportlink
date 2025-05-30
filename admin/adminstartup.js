var gSport = [];
var gOrganizer = [];
var gClub = [];
var gTournament =[];
var gDivision = [];
var gTeam = [];
var gPlayers = [];
var gMatchs = [];
var importok = [];

var activetournament;
var activeklient;
var iTurnament;
var iDivisions;
var iGroups;
var iTeams;
var iMatchs;
var importMessage = [];
var sTournament;
var sDivisions;
var sGroups;
var sTeams;
var memberData;
var klientId = "recCdECitGpKE2O1F";
var baseId = "appxPi2CoLTlsa3qL";
var isLoggedIn = false;

//lists
var Organizerlist;

document.getElementById("tabselectorholder").style.display = "none";

document.getElementById("logoutbutton").addEventListener("click", function () {
    document.getElementById("loggintabbutton").click();
});

document.getElementById("adminlogoreload").addEventListener("click", function () {
    // Reload websiden
    location.reload();
});



MemberStack.onReady.then(function(member) {
    if (member.loggedIn){
    
        memberData = member;
          // Sjekk om det er desktop- eller mobilvisning
        if (window.innerWidth > 480) { // Anta at desktop er bredere enn 768px
            document.getElementById("tabselectorholder").style.display = "inline-block";
        } else {
            document.getElementById("tabselectorholder").style.display = "inline-flex";
        }
        isLoggedIn = true;

    }else{
        isLoggedIn = false;
        //trykk på loginknapp
        document.getElementById("loggintabbutton").click();
        document.getElementById("tabselectorholder").style.display = "none";
    }
}
);

// Legg til event listener på knappen
document.getElementById("tournamenttabbuttonHeader").addEventListener("click", function () {
    listTournament(gTournament);
});

function startUpAdmin(){

    if(isLoggedIn){
    GETairtable(baseId,"tblbg3RRnKTDBaoeP","recCdECitGpKE2O1F","responsklient")
    document.getElementById("tournamentinfopage").style.display = "none";
    }
}

function responsklient(data){
    let klient = data.fields;
    activeklient = klient;

   

    gSport = convertJSONrow(activeklient.sportjson);
    gOrganizer = convertJSONrow(activeklient.organizerjson);
    gClub = convertJSONrow(activeklient.clubjson);
  
    //filtrer turneringer på brukerrettigheter

    gTournament = userFilterTournament(convertJSONrow(activeklient.tournamentjson));

    listOrganizer(gOrganizer);
    listClub(gClub);
    listTournament(gTournament);

    loadTurnamentSelector(gTournament);


}

function userFilterTournament(data) {
    console.log(memberData);
    if(!memberData?.membership){
        
    }else{
    if (memberData.membership.id === "676520755bf8160002a7ca21") {
        // SA: Returner data ufiltrert
        return data;
    } else if (memberData.membership.id === "67651e7bbeae7a0002c4ea53") {
        // TA: Filtrer basert på memberData.airtable
        let newArray = [];

        for (let tournament of data) {
            // Sjekk om verdien i memberData.airtable finnes i tournament.user-arrayen
            if (tournament.user && Array.isArray(tournament.user)) {
                if (tournament.user.includes(memberData.airtable)) {
                    newArray.push(tournament); // Legg til turneringen hvis den matcher
                }
            }
        }

        //skjul knapper
        document.getElementById("clubtabbutton").style.display = "none";
        document.getElementById("organizertabbutton").style.display = "none";
        return newArray; // Returner filtrert array
    } else {
        // R: Returner tom array eller annen ønsket standard
        //skjul knapper
        document.getElementById("clubtabbutton").style.display = "none";
        document.getElementById("organizertabbutton").style.display = "none";
        return [];
    }
}
}

function getSportlist(){
    var body = airtablebodylistAND({section:1});
    Getlistairtable(baseId,"tbl2FRAzV1Ze5DdYh",body,"responseSportlist");
}

function responseSportlist(data) {
    // Rens rådata
    gSport = rawdatacleaner(data); // Global variabel for videre bruk
}

function getOrganizerlist(){
    var body = airtablebodylistAND({klientid:klientId,archived:0});
    Getlistairtable(baseId,"tbl4bHhV4Bnbz8I3r",body,"responseOrganizerlist");
}

function responseOrganizerlist(data) {
    gOrganizer =  rawdatacleaner(data);// Global variabel for videre bruk
}

function getClublist(){
    var body = airtablebodylistAND({klientid:klientId,archived:0});
    Getlistairtable(baseId,"tblqf56gcQaGJsBcl",body,"responseClublist");
}

function responseClublist(data){
    gClub =  rawdatacleaner(data);// Global variabel for videre bruk
}

//uploader
const ctx = document.querySelector('uc-upload-ctx-provider')
    ctx.addEventListener('file-url-changed', e => {
    const uploadedFileInfo = e.detail; // Detaljer om den opplastede filen
    const urlToXlsFile = uploadedFileInfo.cdnUrl; // Hent URL til bildet fra `cdnUrl`
    importXlsFile(urlToXlsFile);
});

async function importXlsFile(urlToXlsFile) {
        // Last ned filen
        const response = await fetch(urlToXlsFile);
        if (!response.ok) {
            throw new Error("Kunne ikke laste ned filen");
        }
        const arrayBuffer = await response.arrayBuffer();

        // Initialiser ExcelJS workbook
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        // Arknavn vi ønsker å lese
        const sheetNames = ["Turnering","Divisjoner", "Lag", "Kamper","Finalekamper"];
        const result = {};

        // Iterer gjennom arknavnene
        for (const sheetName of sheetNames) {
            const worksheet = workbook.getWorksheet(sheetName);

            if (!worksheet) {
                console.warn(`Arket "${sheetName}" finnes ikke i filen.`);
                result[sheetName] = [];
                continue;
            }

            // Hent dataene
            const sheetData = [];
            const headers = [];
            worksheet.eachRow((row, rowIndex) => {
                if (rowIndex === 1) {
                    // Lag header fra første rad
                    row.eachCell((cell, colIndex) => {
                        headers[colIndex] = cell.text.trim();
                    });
                } else {
                    // Lag et objekt for hver rad basert på headeren
                    const rowData = {};
                    row.eachCell((cell, colIndex) => {
                        const header = headers[colIndex];
                        if (header) {
                            rowData[header] = cell.text.trim();
                        }
                    });
                    sheetData.push(rowData);
                }
            });

            result[sheetName] = sheetData;
        }
        
        // Resultatet inneholder data for hvert ark
        console.log("Importerte data:", result);
        importedData(result);
        return result; // Returner data som objekt med arrays for hvert ark
 
}

 
function viewTurnamentData(data) {
    const list = document.getElementById("importlist");
    list.replaceChildren(); // Fjern tidligere innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".turnamentlayoutelement");

    if (!nodeelement) {
        console.error("Kan ikke finne mal-elementet med klassen 'turnamentlayoutelement'");
        return;
    }

    let turnamentUpgrade = false;
   
        const rowelement = nodeelement.cloneNode(true);

        // Fyll ut data i radens felter
        rowelement.querySelector(".name").textContent = data.name || "Ukjent navn";
        rowelement.querySelector(".organizername").textContent = data.organizername || "Ukjent arrangør";
        rowelement.querySelector(".sportname").textContent = data.sportname || "Ukjent sport";
        rowelement.querySelector(".startdate").textContent = formatDate(data.startdate) || "Ukjent startdato";
        rowelement.querySelector(".enddate").textContent = formatDate(data.enddate) || "Ukjent sluttdato";

        // Legg til rad i listen
        list.appendChild(rowelement);
        if(data.airtable){turnamentUpgrade = true};
    
    let text = "Turneringen er klar til å opprettes?";
    if(turnamentUpgrade){text = "Turneringen er funnet i systemet og klar for å oppgraderes?";}
    const importpanel = document.getElementById("importpanel");
    importpanel.style.display = "block";
    importpanel.querySelector(".discriptiontext").textContent = "Ønsker du å opprette turneringen over?";
    importpanel.querySelector(".importbuttonpanel").style.display = "block";
    const button = importpanel.querySelector(".videreknapp");

}

function viewGroupAndTeams(list,division){
// sjekk om det er noen grupper

    if(division.group.length>0){
    //det er grupper her list si opp med tilhørende lag under
    
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".groupstruktureholder");
            for(let group of division.group ){
                // Fyll ut data i radens felter
                const rowelement = nodeelement.cloneNode(true);
                rowelement.querySelector(".name").textContent = group.name || "Ukjent navn";
                list.appendChild(rowelement);
                viewTeams(list, division.name, group.name)
            }
    }

}

function viewTeams(list, divisionname, groupname) {
    // Filtrer team basert på divisjon og gruppe
    const filterteam = iTeams.filter(team => 
        team.divisionname === divisionname && team.groupname === groupname
    );

    if (filterteam.length === 0) {
        console.warn(`Ingen lag funnet for divisjon: "${divisionname}" og gruppe: "${groupname}".`);
        return;
    }

    // Finn mal-elementet for rader
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".teamsstruktureholder");

    if (!nodeelement) {
        console.error("Feil: Mal-elementet for lag (.teamelement) finnes ikke.");
        return;
    }

    // Opprett rader for hvert team
    for (let team of filterteam) {
        // Klon mal-elementet
        const rowelement = nodeelement.cloneNode(true);

        // Sett verdier i radens felter
        rowelement.querySelector(".name").textContent = team.name || "Ukjent navn";
        //rowelement.querySelector(".club").textContent = team.club || "Ukjent klubb";

        if (team.logo) {
            const logoElement = rowelement.querySelector(".teamlogo");
            if (logoElement) {
                logoElement.src = team.logo;
            }
        }

        // Legg til rad i listen
        list.appendChild(rowelement);
    }

    console.log(`Fant ${filterteam.length} lag for divisjon "${divisionname}" og gruppe "${groupname}".`);
}

// Hjelpefunksjon for å formatere datoer
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("no-NO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function listClub(clubs) {
    // Sorter clubs alfabetisk etter club.name
    clubs.sort((a, b) => {
        const nameA = a.name?.toLowerCase() || ""; // Håndter undefined eller null
        const nameB = b.name?.toLowerCase() || "";
        return nameA.localeCompare(nameB);
    });

    const list = document.getElementById("clublistholder");
    list.replaceChildren(); // Fjern tidligere innhold

    // Oppdater antall rader i overskriften
    list.parentElement.querySelector(".rowcounter").textContent = `${clubs.length} stk.`;

    let tabelid = "tblqf56gcQaGJsBcl";
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".clubrow");

    for (let club of clubs) {
        const rowelement = nodeelement.cloneNode(true);

        // Oppdater logo hvis den finnes
        if (club.logo) {
            rowelement.querySelector(".teamlogo").src = club.logo;
        }

        // Oppdater klubbnavn og legg til klikkhendelse for redigering
        const ClubName = rowelement.querySelector(".name");
        ClubName.textContent = club.name || "-";
        ClubName.addEventListener("click", () =>
            triggerEditInput(ClubName, club, "name", "text", tabelid)
        );

        // Konverter sport-array til alternativer for dropdown
        let sportOptions = convertArrayToOptions(gSport, "name", "airtable");

        // Oppdater sportsnavn og legg til klikkhendelse for redigering
        const Sportname = rowelement.querySelector(".sportname");
        Sportname.textContent = club.sportname || "-";
        Sportname.addEventListener("click", () =>
            triggerEditDropdown(Sportname, club, "sport", sportOptions, tabelid)
        );

        // Oppdater land (default til "Norge")
        rowelement.querySelector(".contry").textContent = club.contry || "Norge";

        // Legg til raden i listen
        list.appendChild(rowelement);
    }
}

function listOrganizer(organizers) {
 
    const list = document.getElementById("organizerlistholder");
    list.replaceChildren(); // Fjern tidligere innhold

    list.parentElement.querySelector(".rowcounter").textContent = organizers.length+" stk.";
    let tabelid = "tbl4bHhV4Bnbz8I3r";
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".organizerrow");

    for (let organizer of organizers) {
        const rowelement = nodeelement.cloneNode(true);

        if(organizer.logo){
            rowelement.querySelector(".teamlogo").src = organizer.logo;
        }
        
        const OrganizerName = rowelement.querySelector(".name")
        OrganizerName.textContent = organizer.name || "-";
        OrganizerName.addEventListener("click", () => triggerEditInput(OrganizerName, organizer, "name", "text",tabelid));

        rowelement.querySelector(".contry").textContent = organizer.contry || "Norge";

        const switsjElement = rowelement.querySelector(".organizeractive"); 
        if (organizer?.archived){

           switsjElement.checked = false;
        }else{
           switsjElement.checked = true;
         }
       
        list.appendChild(rowelement);
    }
}

function listTournament(tournaments) {
    const list = document.getElementById("tournamentlistholderlist");
    list.replaceChildren(); // Clear previous content

    //sorter turneringer etter startdato nyest øverst
    tournaments.sort((a, b) => {
        const dateA = new Date(a.startdate);
        const dateB = new Date(b.startdate);
        return dateB - dateA; // Sorter i synkende rekkefølge
    });
    
    //tabelid for lagring lokalt og på server
    let tabelid = "tblGhVlhWETNvhrWN";
    // Update the row counter
    list.parentElement.querySelector(".rowcounter").textContent = `${tournaments.length} stk.`;

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".tournamentrow");

    for (let tournament of tournaments) {
        const rowelement = nodeelement.cloneNode(true);

        // Set tournament icon if available
        if (tournament.icon) {
            rowelement.querySelector(".teamlogo").src = tournament.icon;
        }

        // Set tournament name and organizer name
        const tournamentName = rowelement.querySelector(".name");
        tournamentName.textContent = tournament.name || "-";
       
        

        rowelement.querySelector(".organizername").textContent = tournament.organizername || "-";

        // Add click event for the row
        rowelement.addEventListener("click", () => {
            // Trigger tournament tab button click
            openTournament(tournament.airtable);

            const selector = document.getElementById("tournamentSelector");

            // Find and set the matching option in the selector
            const matchingOption = Array.from(selector.options).find(
                (option) => option.value === tournament.airtable
            );

            if (matchingOption) {
                matchingOption.selected = true; // Set the option itself
            }
        });

        // Append the row to the list
        list.appendChild(rowelement);
    }
}



