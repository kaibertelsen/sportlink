
function importedData(data){
    importMessage = [];
    iTurnament = controllTurnament(convertImportDataTurnament(data.Turnering));
    iDivisions = controllDivision(data.Divisjoner);
    iTeams = controllTeam(data.Lag);
    iMatchs = controllMatch(data.Kamper,data.Finalekamper);
    viewimportinfo();
}

function viewimportinfo() {
    const messageHolder = document.getElementById("messageholder");
    const buttonpanel = document.getElementById("importbuttonpanel");
    const pointholderpanel = document.getElementById("pointholderpanel");
    
    if (importMessage.length === 0) {
        pointholderpanel.style.display = "inline-block";
        let countGroup = 0;
        let countEndplay = 0;
        
        for(let division of iDivisions){
            countGroup  += division.group.length;
            countEndplay += division.endplay.length;
        }

        // Klar for import
        let info = `
            Xls-filen er klar for import:<br>
            Det er funnet:<br>
        `;
        pointholderpanel.querySelector(".messageinfo").innerHTML = info;
        pointholderpanel.querySelector(".division").textContent = iDivisions.length+"stk. Divisjoner";
        pointholderpanel.querySelector(".group").textContent = countGroup+"stk.  Grupper";
        pointholderpanel.querySelector(".endplay").textContent = countEndplay+"stk. Sluttspill";
        pointholderpanel.querySelector(".team").textContent = iTeams.length+"stk. Lag";
        pointholderpanel.querySelector(".match").textContent = iMatchs.length+"stk.Kamper";
        
        buttonpanel.style.display = "block";
        const button = buttonpanel.querySelector(".videreknapp");
        button.onclick = function () {
            saveTournamentToServer();
            pointholderpanel.querySelector(".loadingholder").style.display = "block";
        }

    } else {
        // Ikke klar for import
        pointholderpanel.style.display = "none";
        // Må utføre tilbakemeldinger
        let message = "Xls-filen er ikke klar for import, følgende feil er funnet:<br>";
        const errorList = importMessage.map((error, index) => `<li>${index + 1}. ${error}</li>`).join("");

        message += `<ul>${errorList}</ul>`;
        messageHolder.innerHTML = message;
        buttonpanel.style.display = "none";
    }
}

function saveTournamentToServer() {
    console.log(iTurnament);

    // Opprett en kopi av iTurnament for å unngå sideeffekter
    let body = { ...iTurnament };
    body.klient = ["recCdECitGpKE2O1F"];
    //for ikke publisere med en gang
    body.hidden = true;

    //brukerrettigheter
    if(memberData?.airtable){
        body.user = [memberData.airtable]
    }

    // Fjern nøklene 'sportname' og 'organizername' fra body
    delete body.sportname;
    delete body.organizername;

    // Opprett turnament
    POSTairtable(baseId, "tblGhVlhWETNvhrWN", JSON.stringify(body), "responseCreatTurnament");
}

function responseCreatTurnament(data) {
    console.log(data);

    sTournament = data.fields;
    // Hent `tournamentid` fra responsen
    let tournamentid = data.id;

    // Legg til `tournamentid` i hver divisjon, formater `endplay` og fjern `group`
    const formattedDivisions = iDivisions.map(({ group, ...division }) => {
        return {
            ...division,
            tournament: [tournamentid], // Legg til `tournamentid`
            endplay: JSON.stringify(division.endplay)
        };
    });

    console.log("Formatterte divisjoner med tournament ID (uten 'group'):", formattedDivisions);

    // Send til `multisave`
    multisave(formattedDivisions, baseId, "tblY9xnfQ1y8dXTaA", "responsCreatDivisions");
}

function setPointIcon(name) {
    // Marker punkt
    const pointholderpanel = document.getElementById("pointholderpanel");
  
    // Finn elementet basert på `name`
    const targetElement = pointholderpanel.querySelector(name);
    const imagePoint = targetElement.parentElement.querySelector(".imagepoint");
    imagePoint.removeAttribute("src");
    imagePoint.removeAttribute("srcset");
      
    if (imagePoint) {
        imagePoint.src = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675845629945e9a41d5ad653_done.png";
    }
}

function resetPointHolder() {

    // Marker punkt
    const pointholderpanel = document.getElementById("pointholderpanel");
    pointholderpanel.querySelector(".messageinfo").innerHTML = "";
    pointholderpanel.querySelector(".division").textContent = "";
    pointholderpanel.querySelector(".group").textContent = "";
    pointholderpanel.querySelector(".endplay").textContent = "";
    pointholderpanel.querySelector(".team").textContent = "";
    pointholderpanel.querySelector(".match").textContent = "";
    pointholderpanel.style.display = "none";
    
    // Fjern tidligere klikkhendelser ved å erstatte `onclick`
    const buttonpanel = document.getElementById("importbuttonpanel");
    buttonpanel.style.display = "none";
    const button = buttonpanel.querySelector(".videreknapp");
    button.onclick = null;


    // Finn elementet basert på `name`
    const targetElement = pointholderpanel.querySelector(".match");

    const imagePoint = targetElement.parentElement.querySelectorAll(".imagepoint");

    for(let image of imagePoint){
        image.removeAttribute("src");
        image.removeAttribute("srcset");
          
        if (image) {
            image.src = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/67051259d0e8738b9c4c8ef6_favo-icon.png";
        }


    }
   
}
  
function responsCreatDivisions(data){

    sDivisions = convertMultiResponseData(data);

    //marker punkt
    setPointIcon(".division");
    setPointIcon(".endplay");

    iGroups = getGroupsWithDivisionAirtable(iDivisions, sDivisions)
    
    if(iGroups.length>0){
  // Send til `multisave`
    multisave(iGroups, baseId, "tblq6O7fjqtz5ZOae", "responsCreatGroups");
    }else{
    saveTeamsToServer();
    }
}

function getGroupsWithDivisionAirtable(idivisions, sdivisions) {
    const groups = [];

    idivisions.forEach(division => {
        const divisionName = division.name;

        // Finn divisjonen i sDivisions for å hente airtable ID
        const matchingDivision = sdivisions.find(sDiv => sDiv.name === divisionName);
        const airtableId = matchingDivision ? matchingDivision.airtable : null;

        // Sjekk om group eksisterer og er en array før iterasjon
        if (Array.isArray(division.group)) {
            division.group.forEach(group => {
                groups.push({
                    name: group.name,
                    division: airtableId ? [airtableId] : []
                });
            });
        } else {
            console.warn(`Divisjon "${divisionName}" har ingen grupper eller ugyldig format for grupper.`);
        }
    });

    return groups;
}

function responsCreatGroups(data){
    sGroups = convertMultiResponseData(data);
       //marker punkt
       setPointIcon(".group");
    console.log(sGroups);
//starte lag eksport
saveTeamsToServer();
}

function saveTeamsToServer() {
    console.log("Original iTeams:", iTeams);

    // Legg til division, group, club og tournament Airtable IDs
    const updatedTeams = iTeams.map(team => {
        // Finn division Airtable ID fra sDivisions
        const divisionRecord = sDivisions.find(div => div.name === team.divisionname);
        const divisionAirtableId = divisionRecord ? divisionRecord.airtable : null;

        // Finn group Airtable ID fra sGroups hvis groupname finnes
        let groupAirtableId = null;
        if (team.groupname) {
            const groupRecord = sGroups.find(
                group =>
                    group.name === team.groupname &&
                    group.division.includes(divisionAirtableId) // Sjekk at gruppen tilhører divisjonen
            );
            groupAirtableId = groupRecord ? groupRecord.airtable : null;
        }

        // Finn club Airtable ID fra gClub basert på clubname
        const clubRecord = gClub.find(club => club.name === team.clubname);
        const clubAirtableId = clubRecord ? clubRecord.airtable : null;

        // Opprett et nytt team-objekt uten clubname, divisionname, groupname
        const { clubname, divisionname, groupname, ...rest } = team;

        return {
            ...rest,
            division: divisionAirtableId ? [divisionAirtableId] : [], // Legg til division Airtable ID
            group: groupAirtableId ? [groupAirtableId] : [], // Legg til group Airtable ID hvis den finnes
            club: clubAirtableId ? [clubAirtableId] : [], // Legg til club Airtable ID hvis den finnes
            tournament: [sTournament.airtable] // Legg til tournament Airtable ID
        };
    });

    console.log("Oppdaterte iTeams:", updatedTeams);

    // Send oppdaterte teams til server
    multisave(updatedTeams, baseId, "tbl3ta1WZBr6wKPSp", "responseSaveTeams");
}

function responseSaveTeams(data){
    sTeams = convertMultiResponseData(data);
       //marker punkt
       setPointIcon(".team");
    console.log(data);

//starte å importer kamper
saveMatchsToServer();
}

function saveMatchsToServer() {
    console.log("Original iMatchs:", iMatchs);

    const updatedMatches = iMatchs.map(match => {
        // Finn division Airtable ID fra sDivisions
        const divisionRecord = sDivisions.find(div => div.name === match.divisionname);
        const divisionAirtableId = divisionRecord ? divisionRecord.airtable : null;

        // Finn group Airtable ID fra sGroups hvis groupname finnes
        let groupAirtableId = null;
        if (match.groupname) {
            const groupRecord = sGroups.find(
                group =>
                    group.name === match.groupname &&
                    group.division.includes(divisionAirtableId) // Sjekk at gruppen tilhører divisjonen
            );
            groupAirtableId = groupRecord ? groupRecord.airtable : null;
        }

        // Finn team1 Airtable ID fra sTeams hvis team1name finnes
        let team1AirtableId = null;
        if (match.team1name) {
            const team1Record = sTeams.find(
                team =>
                    team.name === match.team1name &&
                    team.division && team.division.includes(divisionAirtableId) // Sjekk divisjon
            );
            team1AirtableId = team1Record ? team1Record.airtable : null;
        }

        // Finn team2 Airtable ID fra sTeams hvis team2name finnes
        let team2AirtableId = null;
        if (match.team2name) {
            const team2Record = sTeams.find(
                team =>
                    team.name === match.team2name &&
                    team.division && team.division.includes(divisionAirtableId) // Sjekk divisjon
            );
            team2AirtableId = team2Record ? team2Record.airtable : null;
        }

        // Konverter `endplayplace` til numerisk format hvis det finnes
        const endplayplaceNumeric = match.endplayplace ? parseInt(match.endplayplace, 10) : null;

        // Opprett et nytt match-objekt uten team1name, team2name, groupname, divisionname
        const { team1name, team2name, groupname, divisionname, ...rest } = match;

        return {
            ...rest,
            division: divisionAirtableId ? [divisionAirtableId] : [], // Legg til division Airtable ID
            group: groupAirtableId ? [groupAirtableId] : [], // Legg til group Airtable ID hvis den finnes
            team1: team1AirtableId ? [team1AirtableId] : [], // Legg til team1 Airtable ID hvis den finnes
            team2: team2AirtableId ? [team2AirtableId] : [], // Legg til team2 Airtable ID hvis den finnes
            endplayplace: endplayplaceNumeric, // Legg til numerisk `endplayplace`
            tournament: [sTournament.airtable] // Legg til tournament Airtable ID
        };
    });

    console.log("Oppdaterte iMatchs:", updatedMatches);

    // Send oppdaterte matcher til server
    multisave(updatedMatches, baseId, "tblrHBFa60aIdqkUu", "responseSaveMatches");
}

function responseSaveMatches(data){
    sMatch = convertMultiResponseData(data);
       //marker punkt
       setPointIcon(".match");
    console.log(data);

    allIsImported();

}


function allIsImported() {
    // Hent `pointholderpanel` og knapp
    const pointholderpanel = document.getElementById("pointholderpanel");
    pointholderpanel.querySelector(".loadingholder").style.display = "none";

    const buttonpanel = document.getElementById("importbuttonpanel");
    
    if (!pointholderpanel || !buttonpanel) {
        console.warn("Enten 'pointholderpanel' eller 'buttonpanel' mangler i DOM.");
        return;
    }

    const button = buttonpanel.querySelector(".videreknapp");
    if (!button) {
        console.warn("Knappen '.videreknapp' finnes ikke i buttonpanel.");
        return;
    }

    // Endre tekstinnhold på knappen
    button.textContent = "Åpne importert turnering";
    button.classList.add("open");

    // Fjern tidligere klikkhendelser ved å erstatte `onclick`
    button.onclick = null;

    gTournament.push(sTournament);
    // Legg til ny klikkhendelse
    button.onclick = function () {
        openTournament(sTournament.airtable);
    
        // Hent dropdown (selector)
        const selector = document.getElementById("tournamentSelector");
    
        // Legg til turneringen i dropdown
        const newOption = document.createElement("option");
        newOption.value = sTournament.airtable;
        newOption.textContent = sTournament.name;
        selector.appendChild(newOption);
    
        // Sett den nye turneringen som valgt
        selector.selectedIndex = selector.options.length - 1; // Velg den siste (nyeste) turneringen
        //tøm og klargjør importscreen
        resetPointHolder();

    };
    

}





