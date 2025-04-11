function loadMatchLog(rowelement, match) {
  const newmatchloggrow = rowelement.querySelector('.matchloggaddrowconteiner');
  newmatchloggrow.dataset.matchid = match.airtable;

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
  const logplayedminutes = newmatchloggrow.querySelector('.logplayedminutes');
  const logdescription = newmatchloggrow.querySelector('.logdescription');

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
  //tømme felt
  logplayedminutes.value = "";
  logplayer.value = "";
  logassistplayer.value = "";
  logplayer.dataset.airtable = "";
  logassistplayer.dataset.airtable = "";
  logdescription.value = "";




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

  
// 👉 Erstatt gammel saveButton med klone (for å fjerne tidligere event listeners)
const oldSaveButton = newmatchloggrow.querySelector('.logsavebutton');
const saveButton = oldSaveButton.cloneNode(true);
oldSaveButton.parentNode.replaceChild(saveButton, oldSaveButton);

// 🎯 Legg så til ny event listener
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

  const required = [
    { label: 'Minutter', value: data.playedminutes },
    { label: 'Periode', value: data.period },
    { label: 'Lag', value: data.team },
    { label: 'Hendelse', value: data.eventtype },
    { label: 'Spiller', value: data.player?.[0] },
  ];

  if (logassistplayer.value != "") {
    required.push({ label: 'Assist-spiller', value: logassistplayer?.dataset?.airtable });
    data.assistplayer = [logassistplayer?.dataset?.airtable];
  }

  if (logpenaltyminutes?.value != "") {
    data.penaltyminutes = Number(logpenaltyminutes?.value.trim());
  }

  const missing = required.filter(f => !f.value);
  if (missing.length > 0) {
    alert(`Følgende felt mangler: ${missing.map(f => f.label).join(', ')}`);
    return;
  }

  POSTairtable("appxPi2CoLTlsa3qL", "tbliutqJJOHRsN8mw", JSON.stringify(data), "responsSaveMatchLog");
});

  const logpenaltyminutes = newmatchloggrow.querySelector('.logpenaltyminutes');
  const logpenaltyContainer = logpenaltyminutes?.closest('.loginputconteiner');
  const logassistplayerConteiner = logassistplayer?.closest('.loginputconteiner');

  // Skjul feltet som standard
  if (logpenaltyContainer) {
    logpenaltyContainer.style.display = "none";
  }
  
  logassistplayerConteiner.style.display = "none"; // Skjul assist-spiller feltet som standard
  
  // Vis/skjul logikk basert på valgt hendelse
  logeventtype.addEventListener('change', () => {
    
    const selected = logeventtype.value;
    const eventData = parseSportEventLog(activetournament.sporteventsportlogjson)
    .find(event => event.airtable === selected);

    //hvis det er utvisning
    if (selected === "recfYDgKdjfiDSO4g" || selected === "reclsQ8SpocBhDlsy") { 
      logpenaltyContainer.style.display = "block";
      logassistplayerConteiner.style.display = "none"; // Skjul assist-spiller feltet
    } else {
      logpenaltyContainer.style.display = "none";
      logpenaltyminutes.value = ""; // Nullstill feltet hvis det skjules
      logassistplayerConteiner.style.display = "block"; // Vis assist-spiller feltet
    }


    //sjekke om dette eventet har 1 i nøkkelen point, da skal assisk kunne legges inn
   if(eventData && eventData.point == "1") {
      logassistplayer.disabled = false;
      logassistplayerConteiner.style.display = "block"; // Vis assist-spiller feltet
    }else{
      logassistplayer.disabled = true;
      logassistplayerConteiner.style.display = "none"; // Skjul assist-spiller feltet
    }

  });

  //last inn eksisterende logg for denne kampen
  listLogForMatch(match, rowelement,true);

}



function responsSaveMatchLog(response) {
  const logData = JSON.parse(response.fields.json); 

  const matchId = response.fields.match?.[0];
  if (!matchId) {
    console.warn("❌ Ingen match-ID funnet i responsen:", response);
    return;
  }

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

  //laste kampen inn på nytt
  const rowelement = document.getElementById(match.airtable+"matchrow");
  if (!rowelement) {
    console.warn("❌ Fant ikke rad-elementet for kampen:", matchId);
    return;
  }
  // Bygg listen på nytt
  loadMatchLog(rowelement, match);
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

  // 🔁 Fjern tidligere eventListener ved å bruke et flagg
  if (inputField._autocompleteInitialized) return;
  inputField._autocompleteInitialized = true;

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


function listLogForMatch(match, rowelement,admin) {
  const list = rowelement.querySelector('.matchloglist');
  list.innerHTML = "";

  const elementholder = rowelement.querySelector('.loggelementholder');
  elementholder.style.display = "none";

  const noderow = elementholder.querySelector('.loggrow');

  const matchlogg = match.matchlogg || [];
  //sortering etter omgang så minutter
  matchlogg.sort((a, b) => {
    const periodA = a.period === "OT" ? 100 : a.period === "SO" ? 200 : Number(a.period);
    const periodB = b.period === "OT" ? 100 : b.period === "SO" ? 200 : Number(b.period);
  
    if (periodA !== periodB) {
      return periodA - periodB;
    }
  
    return Number(a.playedminutes) - Number(b.playedminutes);
  });
  

  let goalteam1 = 0;
  let goalteam2 = 0;

  //legge inn start conteiner
  const startConteiner = elementholder.querySelector('.start');
  const startRow = startConteiner.cloneNode(true);

  const team1name = match.team1name;
  const team2name = match.team2name;
  const team1Element = startRow.querySelector('.team1lable');
  const team2Element = startRow.querySelector('.team2lable');
  team1Element.textContent = team1name;
  team2Element.textContent = team2name;

  list.appendChild(startRow);

  const periodeConteinerMal = elementholder.querySelector('.periodconteiner');
  

  let activePeriode = matchlogg[0]?.period || 1;

  matchlogg.forEach(log => {
    const logRow = noderow.cloneNode(true);

    //finn ut om dette er en ny periode og legge til conteiner
    const periode = log.period;
    if (periode !== activePeriode) {
      activePeriode = periode;
      const newPeriodeRow = periodeConteinerMal.cloneNode(true);
      const periodeElement = newPeriodeRow.querySelector('.periodelable');

      let periodename = "";
      const period = log.period;
      if (period === "OT") {
        periodename = "Ekstraomgang";
      } else if (period === "SO") {
        periodename = "Straffekonk";
      }
      else {
        const periodNumber = Number(period);
        if (periodNumber > 0) {
          periodename = `${periodNumber}. omgang`;
        }
      }
      periodeElement.textContent = periodename;


      list.appendChild(newPeriodeRow);
    }

    //finne ut om dette er loggen fra lag 1 eller lag 2
    const team = log.team;
    const team1 = match.team1;
    const team2 = match.team2;

    //er det team1 så skal en benytte wraperen med klasse rowteam1
    const rowteam1 = logRow.querySelector('.rowteam1');
    const rowteam2 = logRow.querySelector('.rowteam2');
    const thisIsteam1 = team === team1;
    if (thisIsteam1) {
      rowteam2.remove();
    } else {
      rowteam1.remove();
    }

  // om det er admin 
    const deletebutton = logRow.querySelector('.deletebuttonlogg');
    if (admin) {
      deletebutton.style.display = "block";

      deletebutton.addEventListener('click', (e) => {
        e.preventDefault();

        const bekreft = confirm("⚠️ Er du sikker på at du vil slette denne hendelsen?");
        if (!bekreft) return;

        // Send loggen til delete-funksjonen
        deleteLog(match,log);

        // Oppdater visningen lokalt etter sletting
        listLogForMatch(match, rowelement, admin);
      });

    } else {
      deletebutton.style.display = "none";
    }

   
    const minutesElement = logRow.querySelector('.logminutes');
    let minutes = log.playedminutes+" '";
    minutesElement.textContent = minutes;

    const eventiconElement = logRow.querySelector('.eventicon');
    let urlIcon = log.eventicon;
    if (urlIcon) {
      eventiconElement.src = urlIcon;
    } 

    const teamElement = logRow.querySelector('.teamname');
    const team1name = match.team1name;
    const team2name = match.team2name;
    const teamname = team === team1 ? team1name : team2name;
    teamElement.textContent = teamname;

    //hvis det er mål så må vi oppdatere antall mål eksemper (1-0)
    const eventtype = log.eventtype;
    const eventName = log.eventtypelable;
    
    //hvis det er et mål 
    const eventPointer = Number(log.eventpoint) || 0;
    //hvis dette er 0 eller større
    if (eventPointer >= 0) {
      if (team === team1) {
        goalteam1 = goalteam1 + eventPointer;
      } else {
        goalteam2 = goalteam2 + eventPointer;
      }
    }

  //lage texten 
    let eventnametext = eventName;
    if (eventPointer > 0) {
      //vise målene kun vis dette eventet er poengivende
      eventnametext = `${eventName} (${goalteam1}-${goalteam2})`;
    }else {
      //vise målene kun vis dette eventet er poengivende
      eventnametext = `${eventName}`;
    }




    const eventnameElement = logRow.querySelector('.eventname');
    eventnameElement.textContent = eventnametext;

    const infoElement = logRow.querySelector('.info');
    const playerName = log.playername || "Ukjent spiller";
    const assistName = log.assistplayername || null;
    
    let htmlInfo = "";
    
    if (eventtype === "recgg7bmscj8GYCua") {
      // Mål
      htmlInfo += `Mål: ${playerName}`;
      if (assistName) htmlInfo += `<br>Assist: ${assistName}`;
    } else if (eventtype === "recfYDgKdjfiDSO4g" || eventtype === "reclsQ8SpocBhDlsy") {
      // Utvisning
      htmlInfo = `Utvisning: ${playerName}<br>${log.penaltyminutes || "?"} min`;
    } else if (eventtype === "recwTupKDW3g2btUl") {
      // Kun assist (hvis det finnes som egen hendelse)
      htmlInfo = `Assist: ${playerName}`;
    } else {
      // Fallback
      htmlInfo = `${eventName}: ${playerName}`;
    }
    
    infoElement.innerHTML = htmlInfo;
    

    list.appendChild(logRow);
  });

  //legg inn slutt conteiner
  const endConteiner = elementholder.querySelector('.end');
  const endRow = endConteiner.cloneNode(true);
  list.appendChild(endRow);

}

function deleteLog(match,log){

  //slett denne log fra match.log arrayen 
  //Fjern loggen lokalt
  if (Array.isArray(match.matchlogg)) {
    match.matchlogg = match.matchlogg.filter(item => item.airtable !== log.airtable);
  }

  DELETEairtable("appxPi2CoLTlsa3qL","tbliutqJJOHRsN8mw",log.airtable,"responseLogDelete")

}

function responseLogDelete(data){
  console.log(data);
}