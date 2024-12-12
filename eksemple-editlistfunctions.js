







// Opprett et input-felt for redigering av tekst
function createInput(currentValue, onSave) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentValue;

    input.addEventListener("blur", () => onSave(input.value));
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") onSave(input.value);
    });

    return input;
}
// Opprett en dropdown (select) for redigering av valg
function createSelect(options, currentValue, onSave) {
    const select = document.createElement("select");

    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === currentValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    select.addEventListener("blur", () => onSave(select.value));
    select.addEventListener("change", () => onSave(select.value));

    return select;
}

function triggerEditInput(cell, company, field) {
    let currentValue = cell.textContent.trim();

    // Hindre flere input-felt
    if (cell.querySelector("input")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    // Opprett input-felt
    const input = document.createElement("input");
    if (field === "valuegroup") {
        input.type = "number";
        currentValue = parseFloat(currentValue.replace(/[^0-9.-]/g, "")) || 0; // Fjern "kr" og formater kun tall
        input.value = currentValue;
        input.style.textAlign = "right"; // Høyrestill teksten
    } else {
        input.type = "text";
        input.value = currentValue;
    }

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-feltet
    cell.parentElement.appendChild(input);
    input.focus();

    // Lagre endringer ved `blur`
    input.addEventListener("blur", () => {
        let newValue = input.value.trim();

        if (newValue && newValue !== currentValue) {
            let savedata = {};
            if (field === "valuegroup") {
                newValue = parseFloat(newValue) || 0; // Konverter til tallverdi
                cell.textContent = `${newValue.toLocaleString()} kr`;
                savedata[field] = newValue;
            } else {
                cell.textContent = newValue;
                savedata[field] = newValue;
            }
            updateCompanyData(company.airtable, savedata);
        } else {
            // Hvis verdien ikke endres, gjenopprett originalen
            if (field === "valuegroup") {
                cell.textContent = `${parseFloat(currentValue).toLocaleString()} kr`;
            } else {
                cell.textContent = currentValue;
            }
        }

        // Fjern input-feltet og vis cellen med den opprinnelige display-verdi
        input.remove();
        cell.style.display = originalDisplay;
    });

    // Lagre endringer ved `Enter` og avbryt ved `Escape`
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            input.blur(); // Trigger `blur`-hendelsen
        } else if (e.key === "Escape") {
            // Avbryt redigeringen
            input.remove();
            if (field === "valuegroup") {
                cell.textContent = `${parseFloat(currentValue).toLocaleString()} kr`;
            } else {
                cell.textContent = currentValue;
            }
            cell.style.display = originalDisplay;
        }
    });
}

function triggerEditDropdown(cell, company, field, options, onSave) {
    const currentValue = cell.textContent.trim();

    // Hindre flere dropdowns
    if (cell.querySelector("select")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    const select = document.createElement("select");

    options.forEach(option => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;

        if (option.text === currentValue) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    // Skjul cellen
    cell.style.display = "none";

    // Legg til dropdown i foreldre-elementet
    cell.parentElement.appendChild(select);
    select.focus();

    // Lagre endringer ved `blur`
    select.addEventListener("blur", () => {
        const selectedOption = options.find(opt => opt.value.toString() === select.value);

        if (selectedOption && selectedOption.text !== currentValue) {
            onSave(selectedOption);
        } else {
            // Hvis verdien ikke endres, gjenopprett originalen
            cell.textContent = currentValue;
        }

        // Fjern dropdown og vis cellen med den opprinnelige display-verdi
        select.remove();
        cell.style.display = originalDisplay;
    });

    // Håndter tastetrykk (Enter for lagring, Escape for avbryt)
    select.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            select.blur(); // Trigger `blur`-hendelsen
        } else if (e.key === "Escape") {
            // Avbryt redigeringen
            select.remove();
            cell.textContent = currentValue;
            cell.style.display = originalDisplay;
        }
    });
}

function triggerEditDate(cell, company, field) {
    const currentValue = cell.textContent.trim();

    // Forhindre flere input-felt eller knapper
    if (cell.querySelector("input") || cell.querySelector("button")) return;

    // Lagre cellens opprinnelige display-verdi
    const originalDisplay = getComputedStyle(cell).display;

    // Opprett input-felt for dato
    const input = document.createElement("input");
    input.type = "date";
    input.value = currentValue !== "Ingen dato" ? currentValue : "";

    // Opprett knapp for å fjerne dato
    const removeButton = document.createElement("button");
    removeButton.textContent = "Fjern dato";
    removeButton.style.marginLeft = "10px";
    removeButton.style.cursor = "pointer";

    // Skjul cellen
    cell.style.display = "none";

    // Legg til input-felt og knapp
    const parent = cell.parentElement;
    parent.appendChild(input);
    parent.appendChild(removeButton);

    let preventBlur = false; // Variabel for å forhindre blur ved knappetrykk

    // Håndter fjerning av dato
    removeButton.addEventListener("mousedown", () => {
        preventBlur = true; // Hindre `blur` fra input-feltet
    });

    removeButton.addEventListener("click", () => {
        let savedata = {};
        savedata[field] = null; // Sett til null for å fjerne dato
        updateCompanyData(company.airtable, savedata);
        cell.textContent = "Ingen dato"; // Oppdater tekst
        cleanup();
    });

    // Funksjon for å lagre endringer
    const saveDate = newValue => {
        let savedata = {};
        savedata[field] = newValue || null; // Sett til null hvis tom verdi
        updateCompanyData(company.airtable, savedata);
        cell.textContent = newValue ? newValue : "Ingen dato"; // Oppdater tekst
        cleanup();
    };

    // Funksjon for å fjerne elementene
    const cleanup = () => {
        input.remove();
        removeButton.remove();
        cell.style.display = originalDisplay;
    };

    // Håndter lagring ved `blur`
    input.addEventListener("blur", () => {
        setTimeout(() => {
            // Forsikre oss om at knappens `click` kjøres først
            if (preventBlur) {
                preventBlur = false;
                return;
            }

            const newValue = input.value.trim();
            if (newValue !== currentValue) {
                saveDate(newValue);
            } else {
                // Gjenopprett originalen hvis ingen endring
                cell.textContent = currentValue;
                cleanup();
            }
        }, 100); // Kort forsinkelse for å prioritere knappens hendelse
    });

    // Håndter `Enter`-tast
    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            input.blur(); // Trigger `blur`-hendelsen
        }
    });

    // Sett fokus på input-feltet
    input.focus();
}

function updateCompanyData(companyId, fieldValue) {

    const company = klientdata.find(item => item.airtable === companyId);

    if (company) {
        // Oppdater lokalt
        let dashboardNeedsUpdate = false; // Sporer om dashboardet trenger oppdatering

        for (const [field, value] of Object.entries(fieldValue)) {
            company[field] = value;

            // Sjekk om dashboardet må oppdateres
            if (field === "valuegroup") {
                dashboardNeedsUpdate = true;
            }else if (field === "gruppe"){
                dashboardNeedsUpdate = true;
            }else if (field === "exit"){
                dashboardNeedsUpdate = true;
            }else if (field === "type"){
                dashboardNeedsUpdate = true;
            }
        }

        // Oppdater dashboard hvis nødvendig
        if (dashboardNeedsUpdate) {
            const dashboardData = calculatingPorteDashboard(klientdata);
            loadDashboardporte(dashboardData);
        }

        // Oppdater på server
        saveToServer(companyId, fieldValue);
  
    } else {
        console.error(`Selskap med ID ${companyId} ikke funnet.`);
    }
}

function saveToServer(companyId, fieldValue) {
    // Lag en kopi av fieldValue for modifikasjon
    const updatedFieldValue = { ...fieldValue };

    // Håndter spesifikke felter
    for (const [field, value] of Object.entries(updatedFieldValue)) {
        if (field === "group") {
            updatedFieldValue["gruppe"] = [value]; // Omdøp "group" til "gruppe"
            delete updatedFieldValue["group"]; // Fjern originalen
        } else if (field === "groupname") {
            delete updatedFieldValue["groupname"]; // Fjern "groupname"
        }
    }

    // Konverter til JSON-streng for sending
    const jsonData = JSON.stringify(updatedFieldValue);
    PATCHairtable(
        "app1WzN1IxEnVu3m0", // App ID
        "tblFySDb9qVeVVY5c", // Tabell ID
        companyId,          // Company ID
        jsonData,           // JSON-data
        "respondcustomerlistupdated" // Callback eller responshåndtering
    );

    console.log(`Oppdatering sendt til server for ID: ${companyId}, Data: ${jsonData}`);
}

function respondcustomerlistupdated(data){
    console.log(data);
}