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
      const playerName = log.playername || "Ukjent spiller";
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


  