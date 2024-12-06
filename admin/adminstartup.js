
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
        const sheetNames = ["Divisjoner", "Lag", "Kamper"];
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


function importedData(result){
    listImporterDivision(result.Divisjoner)
//Kamper
//Lag
}

function listImporterDivision(divisions) {
    const list = document.getElementById("divisionlist");
    list.replaceChildren(); // Tøm tidligere innhold i listen

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisjonimportelement");

    for (let division of divisions) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".name").textContent = division.Divisjon;

        // Håndter grupper
        const groupsArray = division.Grupper ? division.Grupper.split(",") : [];
        const groupNode = rowelement.querySelector(".groupdiv");
        groupNode.innerHTML = ""; // Fjern tidligere innhold
        for (let group of groupsArray) {
            const groupElement = document.createElement("span");
            groupElement.className = "groupname";
            groupElement.textContent = group.trim();
            groupNode.appendChild(groupElement);
        }

        // Håndter sluttspill
        const endplayNameArray = division.Sluttspill ? division.Sluttspill.split(",") : [];
        const endplayAntArray = division["Sluttspill-finaler"] ? division["Sluttspill-finaler"].split(",") : [];
        const endNode = rowelement.querySelector(".endplaydiv");
        endNode.innerHTML = ""; // Fjern tidligere innhold
        for (let i = 0; i < endplayNameArray.length; i++) {
            const endElement = document.createElement("div");
            endElement.className = "endplayitem";
            const endName = document.createElement("span");
            endName.className = "endname";
            endName.textContent = endplayNameArray[i].trim();
            const endCount = document.createElement("span");
            endCount.className = "endcount";
            endCount.textContent = endplayAntArray[i] || "0"; // Standard til "0" hvis ingen verdi
            endElement.appendChild(endName);
            endElement.appendChild(endCount);
            endNode.appendChild(endElement);
        }

        list.appendChild(rowelement);
    }
}
