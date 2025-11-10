

/*
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
    let penaltyminteam1 = 0;
    let penaltyminteam2 = 0;
  
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
          loadMatchLog(rowelement, match);
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
  
      //regne ut utvisningsminutter
      if (eventtype === "recfYDgKdjfiDSO4g" || eventtype === "reclsQ8SpocBhDlsy") {
        const penaltyminutes = Number(log.penaltyminutes) || 0;
        if (team === team1) {
          penaltyminteam1 = penaltyminteam1 + penaltyminutes;
        } else {
          penaltyminteam2 = penaltyminteam2 + penaltyminutes;
        }
       
      }
  
  
  
      const eventnameElement = logRow.querySelector('.eventname');
      eventnameElement.textContent = eventnametext;
  
      const infoElement = logRow.querySelector('.info');
      const playerName = log.playername || "Spiller ikke registrert";
      const assistName = log.assistplayername || null;
      const eventpoint = log.eventpoint || 0;
      
      let htmlInfo = "";
      
      if (eventpoint == "1") {
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
  
    return {goalteam1,goalteam2,penaltyminteam1,penaltyminteam2};
  
  }
*/


function listLogForMatch(match, rowelement, admin) {
  // Hent nødvendige noder (med guards)
  const list = rowelement?.querySelector('.matchloglist');
  const elementholder = rowelement?.querySelector('.loggelementholder');
  if (!list || !elementholder) {
    return { goalteam1: 0, goalteam2: 0, penaltyminteam1: 0, penaltyminteam2: 0 };
  }

  // Rydd og “frys” visningen mens vi bygger
  list.textContent = "";
  const prevDisplay = elementholder.style.display;
  elementholder.style.display = "none";

  // Maler (behold eksisterende HTML/CSS ved å bruke kloner av malene)
  const noderow = elementholder.querySelector('.loggrow');
  const startConteiner = elementholder.querySelector('.start');
  const periodeConteinerMal = elementholder.querySelector('.periodconteiner');
  const endConteiner = elementholder.querySelector('.end');

  // Hvis maler mangler, returner trygt
  if (!noderow || !startConteiner || !periodeConteinerMal || !endConteiner) {
    elementholder.style.display = prevDisplay || "";
    return { goalteam1: 0, goalteam2: 0, penaltyminteam1: 0, penaltyminteam2: 0 };
  }

  // Bygg et fragment i minnet – ett stort DOM-innsett til slutt
  const frag = document.createDocumentFragment();

  // Start-header (klones én gang)
  const startRow = startConteiner.cloneNode(true);
  const startTeam1 = startRow.querySelector('.team1lable');
  const startTeam2 = startRow.querySelector('.team2lable');
  if (startTeam1) startTeam1.textContent = match.team1name ?? "-";
  if (startTeam2) startTeam2.textContent = match.team2name ?? "-";
  frag.appendChild(startRow);

  // Forhånds-normaliser + sorter effektivt
  const matchlogg = (match.matchlogg || []).map((log) => {
    const p = log.period;
    const periodNum = p === "OT" ? 100 : p === "SO" ? 200 : Number(p ?? NaN);
    const minuteNum = Number(log.playedminutes ?? NaN);
    return { ...log, _periodNum: periodNum, _minuteNum: minuteNum };
  });

  matchlogg.sort((a, b) => {
    if (a._periodNum !== b._periodNum) {
      const pa = Number.isFinite(a._periodNum) ? a._periodNum : 0;
      const pb = Number.isFinite(b._periodNum) ? b._periodNum : 0;
      return pa - pb;
    }
    const ma = Number.isFinite(a._minuteNum) ? a._minuteNum : 0;
    const mb = Number.isFinite(b._minuteNum) ? b._minuteNum : 0;
    return ma - mb;
  });

  // Akkumulatorer (samme return-verdi som før)
  let goalteam1 = 0;
  let goalteam2 = 0;
  let penaltyminteam1 = 0;
  let penaltyminteam2 = 0;

  // Hjelpere
  const team1 = match.team1;
  const team2 = match.team2;
  const team1name = match.team1name ?? "-";
  const team2name = match.team2name ?? "-";
  const PENALTY_TYPES = new Set(["recfYDgKdjfiDSO4g", "reclsQ8SpocBhDlsy"]);

  // Aktiv periode (samme logikk som før – header legges kun ved overgang)
  let activePeriode = matchlogg[0]?.period ?? 1;

  // Iterer loggene – bygg rader i minnet
  for (let i = 0; i < matchlogg.length; i++) {
    const log = matchlogg[i];

    // Periode-overgang → legg inn periodecontainer (klonet mal)
    const periode = log.period;
    if (periode !== activePeriode) {
      activePeriode = periode;
      const newPeriodeRow = periodeConteinerMal.cloneNode(true);
      const periodeElement = newPeriodeRow.querySelector('.periodelable');

      let periodename = "";
      if (periode === "OT") periodename = "Ekstraomgang";
      else if (periode === "SO") periodename = "Straffekonk";
      else {
        const n = Number(periode);
        if (Number.isFinite(n) && n > 0) periodename = `${n}. omgang`;
      }
      if (periodeElement) periodeElement.textContent = periodename;

      frag.appendChild(newPeriodeRow);
    }

    // Bygg en rad effektivt ved å starte fra en lett klon og sette innerHTML kun på barns seksjoner
    const row = noderow.cloneNode(false); // Shallow clone – vi bygger innholdet selv
    row.className = noderow.className;    // behold klassenavn
    // data-attributter kan være nyttige videre
    if (match.airtable) row.setAttribute('data-match-id', match.airtable);
    row.setAttribute('data-log-index', String(i));

    // Avgjør side (team1 / team2)
    const isTeam1 = log.team === team1;

    // Oppdater mål (samme logikk som før)
    const eventPoint = Number(log.eventpoint ?? 0);
    if (eventPoint >= 0) {
      if (isTeam1) goalteam1 += eventPoint;
      else goalteam2 += eventPoint;
    }

    // Utvisningsminutter
    if (PENALTY_TYPES.has(log.eventtype)) {
      const mins = Number(log.penaltyminutes ?? 0);
      if (isTeam1) penaltyminteam1 += mins;
      else penaltyminteam2 += mins;
    }

    // Tekst/HTML-felt
    const minutesTxt = (log.playedminutes ?? "").toString().trim();
    const eventName = log.eventtypelable || "";
    const teamName = isTeam1 ? team1name : team2name;
    const scoreSuffix = eventPoint > 0 ? ` (${goalteam1}-${goalteam2})` : "";
    const playerName = log.playername || "Spiller ikke registrert";
    const assistName = log.assistplayername || "";

    let infoHTML = "";
    if (eventPoint === 1) {
      // Mål
      infoHTML = `Mål: ${playerName}${assistName ? `<br>Assist: ${assistName}` : ""}`;
    } else if (PENALTY_TYPES.has(log.eventtype)) {
      // Utvisning
      const pm = (log.penaltyminutes ?? "?");
      infoHTML = `Utvisning: ${playerName}<br>${pm} min`;
    } else if (log.eventtype === "recwTupKDW3g2btUl") {
      // Assist som egen hendelse
      infoHTML = `Assist: ${playerName}`;
    } else {
      // Fallback
      infoHTML = `${eventName}: ${playerName}`;
    }

    // Bygg radens HTML én gang (raskere enn mange querySelector/setter)
    // NB: bruker samme klassenavn som originalen slik at CSS/JS rundt ikke brytes.
    row.innerHTML = `
      <div class="row ${isTeam1 ? 'rowteam1' : 'rowteam2'}">
        <div class="left">
          <img class="eventicon" ${log.eventicon ? `src="${log.eventicon}"` : `style="display:none"`} loading="lazy" />
          <span class="logminutes">${minutesTxt ? `${minutesTxt} '` : ''}</span>
          <span class="teamname">${teamName}</span>
        </div>
        <div class="right">
          <div class="eventname">${eventName}${scoreSuffix}</div>
          <div class="info">${infoHTML}</div>
          ${admin ? `<button class="deletebuttonlogg" type="button">Slett</button>` : ``}
        </div>
      </div>
    `;

    // Legg på slette-lytter om admin (samme oppførsel som i originalen)
    if (admin) {
      const deleteBtn = row.querySelector('.deletebuttonlogg');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const bekreft = confirm("⚠️ Er du sikker på at du vil slette denne hendelsen?");
          if (!bekreft) return;
          // Samme kall som før:
          // - Vi sender samme objekter som originalkoden forventer
          const currentLog = matchlogg[i];
          deleteLog(match, currentLog);
          // Oppdater visningen lokalt etter sletting (samme navn/signatur)
          loadMatchLog(rowelement, match);
        });
      }
    }

    frag.appendChild(row);
  }

  // Sluttcontainer
  const endRow = endConteiner.cloneNode(true);
  frag.appendChild(endRow);

  // Én operasjon: legg alt inn i DOM
  list.appendChild(frag);

  // Vis container igjen
  elementholder.style.display = prevDisplay || "block";

  // Retur som før
  return { goalteam1, goalteam2, penaltyminteam1, penaltyminteam2 };
}
