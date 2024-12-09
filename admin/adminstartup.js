var gSport = [];
var gOrganizer = [];
var gClub = [];
var activetournament;
var iDivisions;
var iTeams;
var iMatchs;

var klientId = "recCdECitGpKE2O1F";
var baseId = "appxPi2CoLTlsa3qL";

function startUpAdmin(){
    getSportlist()
    getOrganizerlist();
    getClublist();
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

function importedData(data){
    //vise panel;
    document.getElementById("importpanel").style.display = "block";

    let iTurnament = convertImportDataTurnament(data.Turnering);
    activetournament = controllTurnament(iTurnament);
    
    iDivisions = controllDivision(data.Divisjoner);
    iTeams = controllTeam(data.Lag);
    iMatchs = controllMatch(data.Kamper,data.Finalekamper);

    iMatchs = data.Kamper;





    //viewTurnamentData(activetournament);




}

function convertImportDataTurnament(data) {
    // Konverterer dataene til riktig nøkkelnavn
    const convertedData = data.map(item => ({
        name: item.Turneringsnavn || "",
        organizer: item.Arrangement || "",
        sport: item.Sport || "",
        startdate: item.Start || "",
        enddate: item.Slutt || ""
    }));

    console.log(convertedData);
    return convertedData;
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
    button.onclick = function(){
    //videre knapp
    //start kontroll av divisjoner
    let divisions = controllDivision(idivisions);
        viewDevisionData(divisions);
    }


    
    
}



function viewDevisionData(data){
    const list = document.getElementById("importdivisionlist");
    list.replaceChildren(); // Fjern tidligere innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisionstruktureholder");

    for (let division of data){
        // Fyll ut data i radens felter
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".name").textContent = division.name || "Ukjent navn";

        const nodeGroup = rowelement.querySelector(".groupdiv");
        for(let group of division.group){
            const groupElement = nodeGroup.cloneNode(true);
            groupElement.querySelector(".groupname").textContent = group.name || "";
            nodeGroup.parentElement.appendChild(groupElement);
        }
         nodeGroup.style.display = "none";

        
        const endNode = rowelement.querySelector(".endplaydiv");
        for (var i = 0;i<division.endplay.length;i++) {
             const endElement = endNode.cloneNode(true);
             endElement.querySelector(".endname").textContent = division.endplay[i].endplayname;
             endElement.querySelector(".endcount").textContent = division.endplay[i].finalecount;
             endNode.parentElement.appendChild(endElement);
            }       
         endNode.style.display = "none";
        list.appendChild(rowelement);
    }



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




/*
function listDivision(divisions){

    const list = document.getElementById("divisionlist");
    list.replaceChildren();
    
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisjonlayoutelement");
    
        for (let division of divisions) {
            const rowelement = nodeelement.cloneNode(true);
            rowelement.querySelector(".name").textContent = division.Divisjon;
    
                // Konverter "Grupper" til en array
                const groupsArray = division.Grupper.split(","); // Splitt på komma for å lage en array
                const groupNode = rowelement.querySelector(".groupdiv");
                // Legg til hver gruppe som et eget element
                for (let group of groupsArray) {
                    const groupElement = groupNode.cloneNode(true);
                    groupElement.querySelector(".groupname").textContent = group;
                    groupNode.parentElement.appendChild(groupElement);
                }
                groupNode.style.display = "none";
    
    
                const endplayNameArray = division.Sluttspill.split(",");
                const endplayAntArray = division["Sluttspill-finaler"].split(".");
                const endNode = rowelement.querySelector(".endplaydiv");
                for (var i = 0;i<endplayNameArray.length;i++) {
                    const endElement = endNode.cloneNode(true);
                    endElement.querySelector(".endname").textContent = endplayNameArray[i];
                    endElement.querySelector(".endcount").textContent = endplayAntArray[i];
                    endNode.parentElement.appendChild(endElement);
                }
                endNode.style.display = "none";
            list.appendChild(rowelement);
        }
      
    }
*/