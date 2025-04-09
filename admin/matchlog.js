function loadMatchLog(rowelement, match) {
    const newmatchloggrow = rowelement.querySelector('.matchloggaddrowconteiner');


    //sjekke at det er lagt til team 1 og 2
    if (match.team1 === "" || match.team2 === "") {
        newmatchloggrow.style.display = "none";
        return;
    }

    const logperiod = newmatchloggrow.querySelector('.logperiod');
    loadLogPeriodSelector(logperiod, match);

    const logteam = newmatchloggrow.querySelector('.logteam');
    loadLogTeamSelector(logteam, match);

    //finne ut hvilke sport det er
    const parsedArray = parseSportEventLog(activetournament.sporteventsportlogjson);
    console.log(parsedArray);
    

    
}
  
function loadLogPeriodSelector(selector, match) {
    const periods = match.numberOfPeriods || 2;
  
    // Tøm gamle valg
    selector.innerHTML = "";
  
    // Legg til ordinære omganger: 1. omgang, 2. omgang, osv.
    for (let i = 1; i <= periods; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `${i}. omgang`;
      selector.appendChild(option);
    }
  
    // Ekstraomgang
    if (match.overtime) {
      const option = document.createElement("option");
      option.value = "OT";
      option.textContent = "Ekstraomgang";
      selector.appendChild(option);
    }
  
    // Straffekonk
    if (match.shootout) {
      const option = document.createElement("option");
      option.value = "SO";
      option.textContent = "Straffekonk";
      selector.appendChild(option);
    }
}

function loadLogTeamSelector(selector, match) {
    // Tøm gamle valg
    selector.innerHTML = "";
  
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
  
  