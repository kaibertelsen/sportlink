function loadMatchLog(rowelement, match) {
  const newmatchloggrow = rowelement.querySelector('.matchloggaddrowconteiner');

  if (memberData.airtable != "recuSA6q79aU3ndO3") {
    newmatchloggrow.style.display = "none";
    return;
  }

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
  const logassistplayer = newmatchloggrow.querySelector('.logassistplayer');

  let logassistDropdown = logassistplayer.parentElement.querySelector('.logplayer-dropdown');
  if (!logassistDropdown) {
    logassistDropdown = document.createElement('div');
    logassistDropdown.className = 'logplayer-dropdown';
    logassistDropdown.style.position = 'absolute';
    logassistDropdown.style.top = '100%';
    logassistDropdown.style.left = '0';
    logassistDropdown.style.right = '0';
    logassistDropdown.style.display = 'none';
    logassistplayer.parentElement.style.position = 'relative';
    logassistplayer.parentElement.appendChild(logassistDropdown);
  }

  loadLogPeriodSelector(logperiod, match);
  loadLogTeamSelector(logteam, match);
  loadLogSportEvents(logeventtype, match);

  logplayer.disabled = true;
  logassistplayer.disabled = true;

  const handleNewPlayer = (roleLabel) => (name, inputField) => {
    const newPlayer = {
      name,
      team: [logteam.value],
    };
    inputField.id = newPlayer.name + "placeholder";

    POSTairtable("appxPi2CoLTlsa3qL", "tbljVqkOQACs56QqI", JSON.stringify(newPlayer), "responsCreatNewPlayer");
  };

  logteam.addEventListener('change', () => {
    const selectedTeamId = logteam.value;

    [logplayer, logassistplayer].forEach(input => {
      input.value = "";
      input.dataset.airtable = "";
    });
    logplayerDropdown.innerHTML = "";
    logassistDropdown.innerHTML = "";

    if (!selectedTeamId) {
      logplayer.disabled = true;
      logassistplayer.disabled = true;
      return;
    }

    logplayer.disabled = false;
    logassistplayer.disabled = false;

    const players = findPlayersInMatch(match, selectedTeamId);
    initLogPlayerAutocomplete(logplayer, logplayerDropdown, players, handleNewPlayer("spiller"));
    initLogPlayerAutocomplete(logassistplayer, logassistDropdown, players, handleNewPlayer("assistspiller"));
  });

  const saveButton = newmatchloggrow.querySelector('.logsavebutton');
  if (saveButton) {
    saveButton.addEventListener('click', (e) => {
      e.preventDefault();
  
      const data = {
        playedminutes: Number(newmatchloggrow.querySelector('#playedminutes')?.value.trim()),
        period: logperiod?.value.trim(),
        team: [logteam?.value.trim()],
        eventtype: [logeventtype?.value.trim()],
        player: [logplayer?.dataset.airtable],
        description: newmatchloggrow.querySelector('#description')?.value.trim(),
        match: [match.airtable]
      };
      // Legg til assist-spiller hvis valgt
      if (logassistplayer?.dataset.airtable != "") {
        data.assistplayer = [logassistplayer?.dataset.airtable];
      }
      //legg til penetyminutes hvis valgt
      if (logpenaltyminutes?.value != "") {
        data.penaltyminutes = Number(newmatchloggrow.querySelector('.logpenaltyminutes')?.value.trim());
      }
      
      const required = [
        { label: 'Minutter', value: data.playedminutes },
        { label: 'Periode', value: data.period },
        { label: 'Lag', value: data.team },
        { label: 'Hendelse', value: data.eventtype },
        { label: 'Spiller', value: data.player?.[0] },
      ];
  
      const missing = required.filter(f => !f.value);
      if (missing.length > 0) {
        alert(`Følgende felt mangler: ${missing.map(f => f.label).join(', ')}`);
        return;
      }
  
      // Lagre til server
      POSTairtable("appxPi2CoLTlsa3qL", "tbliutqJJOHRsN8mw", JSON.stringify(data), "responsSaveMatchLog");
  
      // Tilbakemelding
      alert("✅ Hendelsen er lagret!");
      console.log("📝 Sendt data:", data);
    });
  }

  const logpenaltyminutes = newmatchloggrow.querySelector('.logpenaltyminutes');
  const logpenaltyContainer = logpenaltyminutes?.closest('.loginputconteiner');
  const logassistplayerConteiner = logassistplayer?.closest('.loginputconteiner');

  
  // Skjul feltet som standard
  if (logpenaltyContainer) {
    logpenaltyContainer.style.display = "none";
  }
  
  // Vis/skjul logikk basert på valgt hendelse
  logeventtype.addEventListener('change', () => {
    const selected = logeventtype.value;
    if (selected === "recfYDgKdjfiDSO4g" || selected === "reclsQ8SpocBhDlsy") { 
      logpenaltyContainer.style.display = "block";
      logassistplayerConteiner.style.display = "none"; // Skjul assist-spiller feltet
    } else {
      logpenaltyContainer.style.display = "none";
      logpenaltyminutes.value = ""; // Nullstill feltet hvis det skjules
      logassistplayerConteiner.style.display = "block"; // Vis assist-spiller feltet
    }
  });

}



function responsSaveMatchLog(response) {
  const logData = JSON.parse(response.fields.json); // Anta at loggen returneres som JSON-streng fra serveren

  const matchId = logData.matchId;
  if (!matchId) return;

  const match = gMatchs.find(m => m.airtable === matchId);
  if (!match) {
    console.warn("❌ Fant ikke kampen i gMatchs:", matchId);
    return;
  }

  // Legg til ny logg i kampens logg-array
  if (!Array.isArray(match.matchlogg)) {
    match.matchlogg = [];
  }
  match.matchlogg.push(logData);

  console.log(`✅ Hendelse lagt til i kamp ${match.nr}`);
  console.log("📋 Oppdatert matchlogg:", match.matchlogg);
}

function responsCreatNewPlayer(data) {
  const name = data.fields.name;
  const teamId = data.fields.team?.[0];
  const newPlayer = JSON.parse(data.fields.json);

  // 1. Finn inputfeltet og sett Airtable-id
  const inputField = document.getElementById(name + "placeholder");
  if (inputField) {
    inputField.dataset.airtable = data.id;
  }

  // 2. Legg til spiller i riktig lag i gTeam
  const team = gTeam.find(t => t.airtable === teamId);
  if (team) {
    const alreadyExists = team.player?.some(p => p.airtable === newPlayer.airtable);
    if (!alreadyExists) {
      team.player = team.player || [];
      team.player.push(newPlayer);
      console.log(`✅ Ny spiller "${name}" lagt til i laget "${team.name}"`);
    }
  }

  // 3. Oppdater lag i gMatchs (team1json og team2json)
  gMatchs.forEach(match => {
    ['team1json', 'team2json'].forEach(key => {
      match[key]?.forEach(team => {
        if (team.airtable === teamId) {
          const exists = team.player?.some(p => p.airtable === newPlayer.airtable);
          if (!exists) {
            team.player = team.player || [];
            team.player.push(newPlayer);
            console.log(`➕ Ny spiller lagt til i kamp ${match.nr} (${key})`);
          }
        }
      });
    });
  });

  console.log("🟢 Fullført oppdatering av spiller i gTeam og gMatchs.");
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
  inputField.dataset.airtable = "";

  inputField.addEventListener('input', () => {
    const searchTerm = inputField.value.toLowerCase().trim();
    dropdownContainer.innerHTML = "";
    inputField.dataset.airtable = ""; // Nullstill ID

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
        inputField.dataset.airtable = player.airtable || "";
        dropdownContainer.style.display = "none";
      });

      dropdownContainer.appendChild(option);
    });

    dropdownContainer.style.display = "block";
  });

  document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target) && e.target !== inputField) {
      dropdownContainer.style.display = "none";
    }
  });

  inputField.addEventListener('blur', () => {
    setTimeout(() => {
      const name = inputField.value.trim();
      const id = inputField.dataset.airtable;

      if (!name || id || typeof onNewPlayerCallback !== 'function') return;

      const confirmed = confirm(`Vil du opprette ny spiller "${name}"?`);
      if (confirmed) {
        onNewPlayerCallback(name, inputField);
      } else {
        inputField.value = "";
        inputField.dataset.airtable = "";
      }
    }, 200);
  });
}
