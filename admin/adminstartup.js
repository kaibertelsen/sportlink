
//uploader
const ctx = document.querySelector('uc-upload-ctx-provider')
    ctx.addEventListener('file-url-changed', e => {
    const uploadedFileInfo = e.detail; // Detaljer om den opplastede filen
    const urlToXlsFile = uploadedFileInfo.cdnUrl; // Hent URL til bildet fra `cdnUrl`
    importXlsFile(urlToXlsFile);
});

async function importXlsFile(urlToXlsFile) {
    try {
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
        const sheetNames = ["Turnering","Divisjoner", "Lag", "Kamper"];
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
    } catch (error) {
        console.error("Feil ved import av XLS-fil:", error.message);
        return null;
    }
}


function importedData(data){


document.getElementById("importpanel").style.display = "block";

let iTurnament = convertImportDataTurnament(data.Turnering);

//listImporterDivision(result.Divisjoner)
//Kamper
//Lag
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


function controllTurnament(turnament){


   if(turnament.SystemId){
    //sjekk med databasen og evt last ned denne turneringen

   }else{
    //Det er et nytt turnament

   }
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