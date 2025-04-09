function loadMatchLog(rowelement, match) {
    const newmatchloggrow = rowelement.querySelector('.matchloggaddrowconteiner');
  
    if (match.team1 === "" || match.team2 === "") {
      newmatchloggrow.style.display = "none";
      return;
    }
  
    newmatchloggrow.style.display = "block";
  
    const logperiod = newmatchloggrow.querySelector('.logperiod');
    const logteam = newmatchloggrow.querySelector('.logteam');
    const logeventtype = newmatchloggrow.querySelector('.logeventtype');
    const logplayer = newmatchloggrow.querySelector('.logplayer');
    const logplayerDropdown = newmatchloggrow.querySelector('.logplayer-dropdown');
  
    // Last inn select-innhold
    loadLogPeriodSelector(logperiod, match);
    loadLogTeamSelector(logteam, match);
    loadLogSportEvents(logeventtype, match);

    logplayer.disabled = true;

  
    // Når lag velges – last spillere og sett opp autocomplete
    logteam.addEventListener('change', () => {
      const selectedTeamId = logteam.value;
      logplayer.value = "";
      logplayer.dataset.airtable = "";
      logplayerDropdown.innerHTML = "";
  
      if (!selectedTeamId) return;
      logplayer.disabled = false;

  
      const players = findPlayersInMatch(match, selectedTeamId);
  
      initLogPlayerAutocomplete(logplayer, logplayerDropdown, players, (name, inputField) => {
        console.log("Oppretter ny spiller:", name);
  
        // Lokal spiller-oppretting (kan erstattes med fetch til server)
        const newPlayer = {
          name,
          nr: "",
          team: selectedTeamId,
          airtable: "" // oppdateres når opprettet på server
        };
  
        // Midlertidig ID-markør
        inputField.dataset.airtable = "ny_spiller_lokal";
  
        // TODO: Legg til logikk for faktisk oppretting i Airtable/server
      });
    });
}
  
function loadLogPeriodSelector(selector, match) {
    const periods = match.numberOfPeriods || 2;
  
    // Tøm gamle valg
    selector.innerHTML = "";

    // Velg periode
    const option1 = document.createElement("option");
    option1.value = "";
    option1.textContent = "Velg periode";
    selector.appendChild(option1);
  
    // Legg til ordinære omganger: 1. omgang, 2. omgang, osv.
    for (let i = 1; i <= periods; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `${i}. omgang`;
      selector.appendChild(option);
    }
  
    // Ekstraomgang
      const option2 = document.createElement("option");
      option2.value = "OT";
      option2.textContent = "Ekstraomgang";
      selector.appendChild(option2);
   
      const option3 = document.createElement("option");
      option3.value = "SO";
      option3.textContent = "Straffekonk";
      selector.appendChild(option3);

}

function loadLogTeamSelector(selector, match) {
    // Tøm gamle valg
    selector.innerHTML = "";

    // Velg lag
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Velg lag";
    selector.appendChild(option);
  
    // lagene id finnes i match.team1 og match.team2 lagnavn finnes i match.team1name og match.team2name
    const team1 = document.createElement("option");
    team1.value = match.team1;
    team1.textContent = match.team1name;
    selector.appendChild(team1);
    const team2 = document.createElement("option");
    team2.value = match.team2;
    team2.textContent = match.team2name;
    selector.appendChild(team2);


}

function parseSportEventLog(rawArray) {
    try {
      // Array med tekst-JSON → parse hver enkelt rad til objekt
      return rawArray.map(item => JSON.parse(item));
    } catch (error) {
      console.error("Feil ved parsing av sporteventsportlogjson:", error);
      return [];
    }
}

function loadLogSportEvents(selector, match) {
    if (!selector || !activetournament?.sporteventsportlogjson) return;
  
    // Parse og sorter events etter norsk label
    let eventsForSport = parseSportEventLog(activetournament.sporteventsportlogjson)
      .sort((a, b) => a.lable.localeCompare(b.lable)); // Sorter alfabetisk på norsk tekst
  
    // Tøm gamle valg
    selector.innerHTML = "";

    // Velg event
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Velg hendelse";
    selector.appendChild(option);
  
    // Legg til options basert på lable og airtable
    eventsForSport.forEach(event => {
      const option = document.createElement("option");
      option.value = event.airtable;
      option.textContent = event.lable; // NB: "lable" som i original JSON
      selector.appendChild(option);
    });
}
  
function findPlayersInMatch(match, teamid) {
    const allTeams = [...(match.team1json || []), ...(match.team2json || [])];
    const selectedTeam = allTeams.find(team => team.airtable === teamid);
  
    if (!selectedTeam || !Array.isArray(selectedTeam.player)) return [];
  
    return selectedTeam.player.sort((a, b) => a.name.localeCompare(b.name));
}
  

function initLogPlayerAutocomplete(inputField, dropdownContainer, allPlayers, onNewPlayerCallback) {
    inputField.dataset.airtable = ""; // nullstill ved nytt valg
  
    inputField.addEventListener('input', () => {
      const searchTerm = inputField.value.toLowerCase().trim();
      dropdownContainer.innerHTML = "";
  
      if (!searchTerm) {
        dropdownContainer.style.display = "none";
        return;
      }
  
      const filtered = allPlayers.filter(player => {
        const nameMatch = player.name?.toLowerCase().includes(searchTerm);
        const numberMatch = player.nr?.toLowerCase().includes(searchTerm);
        return nameMatch || numberMatch;
      });
  
      if (filtered.length === 0) {
        dropdownContainer.style.display = "none";
        return;
      }
  
      filtered.forEach(player => {
        const option = document.createElement('div');
        option.textContent = `${player.nr ? player.nr + " - " : ""}${player.name}`;
        option.style.padding = "8px";
        option.style.cursor = "pointer";
  
        option.addEventListener('click', () => {
          inputField.value = player.name;
          inputField.dataset.airtableId = player.airtable || ""; // lagre spillerens ID
          dropdownContainer.style.display = "none";
        });
  
        dropdownContainer.appendChild(option);
      });
  
      dropdownContainer.style.display = "block";
    });
  
    // Klikk utenfor → skjul dropdown
    document.addEventListener('click', (e) => {
      if (!dropdownContainer.contains(e.target) && e.target !== inputField) {
        dropdownContainer.style.display = "none";
      }
    });
  
    // Hvis bruker forlater feltet uten å velge – vurder å opprette spiller
    inputField.addEventListener('blur', () => {
      setTimeout(() => {
        const name = inputField.value.trim();
        const id = inputField.dataset.airtable;
  
        if (name && !id && typeof onNewPlayerCallback === 'function') {
          onNewPlayerCallback(name, inputField);
        }
      }, 200); // Delay for å unngå konflikt med klikk på dropdown
    });
  }
  
  
  
  