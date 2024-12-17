var copyMatchElementholder;
var alertMessage;
document.getElementById('matchtabbutton').onclick = function() {
    listMatch(gMatchs); 
}

function loadTurnamentSelector(tournaments) {
    // Finn dropdown-elementet
    const selector = document.getElementById("tournamentSelector");

    // Fjern eksisterende valg for å starte med en tom liste
    selector.innerHTML = "";

    // Sorter turneringer alfabetisk basert på navn
    tournaments.sort((a, b) => a.name.localeCompare(b.name, 'nb', { sensitivity: 'base' }));

    // Gå gjennom alle turneringer og legg dem til i dropdown
    tournaments.forEach(tournament => {
        // Opprett et nytt <option>-element
        const option = document.createElement("option");
        option.textContent = tournament.name; // Sett tekst som turneringsnavn
        option.value = tournament.airtable;   // Sett verdi som airtable-id

        // Legg til <option> i <select>
        selector.appendChild(option);
    });

    // Legg til en eventlistener for når verdien endres
    selector.addEventListener("change", () => {
        const selectedValue = selector.value;
        const selectedText = selector.options[selector.selectedIndex].text;
        onTournamentSelected(selectedValue, selectedText);
    });

}

// Funksjon som kjøres når en turnering velges
function onTournamentSelected(airtableId, tournamentName) {
    console.log("Valgt turnering:", tournamentName, "med Airtable ID:", airtableId);
    openTournament(airtableId);
    

}

function openTournament(Tournamentid){
    // Klikk på tournament-knapp
    document.getElementById("tournamenttabbutton").click();

    //
    document.getElementById("tournamenttabbutton").style.display = "inline-block";

    //hvis loader
     document.getElementById("loadingholdertournament").style.display = "block";
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");

    //tøm listene
    document.getElementById("divisionlistholder").replaceChildren();
    document.getElementById("teamlistholder").replaceChildren();
    document.getElementById("matchlistholder").replaceChildren();

    //skjul gruppeselectorer
    document.getElementById("groupSelector").style.display = "none";
}

function responsGetTournament(data) {
    console.log(data.fields);
    //skul loader
    document.getElementById("loadingholdertournament").style.display = "none";
    document.getElementById("tournamentinfopage").style.display = "block";

    // Hent tournament-data
    const tournament = data.fields;
    activetournament = tournament;
   
    // Oppdater turneringsinformasjon
    updateTournamentInfo(tournament);

    // Konverter divisjoner og liste dem opp
    const divisions = convertJSONrow(tournament.divisjonjson);
    gDivision = divisions;
    listDivision(gDivision);

    const teams = convertJSONrow(tournament.teamjson);
    gTeam = teams;
    listTeams(gTeam);

    const matchs = convertJSONrow(tournament.matchjson);
    gMatchs = matchs;
    listMatch(matchs);

}

function updateTournamentInfo(tournament) {

const tournamentinfoheader = document.getElementById("tournamentinfoheader");
    //tabelid for lagring lokalt og på server
    let tabelid = "tblGhVlhWETNvhrWN";

    const tournamentName = tournamentinfoheader.querySelector(".tournamentname");

    // Oppdater turneringsnavn
    tournamentName.textContent = tournament.name || "Ukjent turnering";
    
    // Fjern tidligere event listeners ved å klone elementet
    const newTournamentName = tournamentName.cloneNode(true);
    tournamentName.parentNode.replaceChild(newTournamentName, tournamentName);
    newTournamentName.addEventListener("click", () => 
        triggerEditInput(newTournamentName, tournament, "name", "text", tabelid)
    );

    tournamentinfoheader.querySelector(".tournamenticon").src = tournament.icon || "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png";
    const SportName = tournamentinfoheader.querySelector(".sportname");
            SportName.textContent = tournament.sportname[0] || "Ukjent sport";
            let SportOptions = convertArrayToOptions(gSport,"name","airtable");
            SportName.addEventListener("click", () => triggerEditDropdown(SportName, tournament, "sport", SportOptions, tabelid));


    const startDate = tournamentinfoheader.querySelector(".startdate");
            if(tournament.startdate){
                startDate.textContent = formatIsoDateName(tournament.startdate);
            }else{
                startDate.textContent = "Ukjent startdato";
            }
            startDate.dataset.date = formatIsoDateValue(tournament.startdate);
            startDate.addEventListener("click", () => triggerEditInput(startDate, tournament, "startdate", "datetime-local", tabelid));
    
    const endDate = tournamentinfoheader.querySelector(".enddate");
            if(tournament.enddate){
               endDate.textContent = formatIsoDateName(tournament.enddate)
            }else{
                endDate.textContent = "Ukjent sluttdato";
            }
            endDate.dataset.date = formatIsoDateValue(tournament.enddate);
            endDate.addEventListener("click", () => triggerEditInput(endDate, tournament, "enddate", "datetime-local", tabelid));

    const eventName = tournamentinfoheader.querySelector(".eventname");
            eventName.textContent = tournament.organizername[0] || "Ukjent Arrangement";
            let Organizeroptions = convertArrayToOptions(gOrganizer,"name","airtable");
            eventName.addEventListener("click", () => triggerEditDropdown(eventName, tournament, "organizer", Organizeroptions, tabelid));

    tournamentinfoheader.querySelector(".username").textContent = tournament.username || "";

    const switsj = tournamentinfoheader.querySelector(".merkibj");
    switsj.checked = !tournament?.hidden;

}

function publishTournament() {
    const Pswitch = document.getElementById("publichswitsj");
   
   let message = "Er du sikker på at du vil publisere denne turneringen?";
    if(!Pswitch.checked){
        message = "Er du sikker på at du vil avpublisere denne turneringen?"; 
    }

    // Vis en bekreftelsesdialog
    const userConfirmation = confirm(message);
    
    // Sjekk brukerens valg
    if (userConfirmation) {
        sendPublishRequest();
    } else {
        // Brukeren trykket Avbryt
        console.log("Publisering avbrutt.");
    }
}

function sendPublishRequest() {

    const Pswitch = document.getElementById("publichswitsj");
    let hidden = false;
    if(Pswitch.checked){
        hidden = false;
    }else{
        hidden = true; 
    }

    let body = {hidden:hidden};
    PATCHairtable(baseId,"tblGhVlhWETNvhrWN",activetournament.airtable,JSON.stringify(body),"respondPublish")

}

function respondPublish(data){
    const tournament = data.fields;
    activetournament = tournament;
}

function divisionSelectorChange() {
    
    let divId = document.getElementById("divisionSelector").value;

    // Populate the groupSelector dropdown
    const groupSelector = document.getElementById("groupSelector");

    if (divId === "") {
        // Hide group selector if no division is selected
        groupSelector.style.display = "none";
        groupSelector.replaceChildren(); // Clear previous options

        // Add default option with division name
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Alle grupper`;
        groupSelector.appendChild(defaultOption);

    } else {
        // Find groups associated with the division
        const groups = findGroupByDivision(divId);

        // Find the division name from gDivision
        const division = gDivision.find(div => div.airtable === divId);
        const divisionName = division ? division.name : "divisjon";

        // Show the group selector
        groupSelector.style.display = "block";
        groupSelector.replaceChildren(); // Clear previous options

        // Add default option with division name
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Alle grupper`;
        groupSelector.appendChild(defaultOption);

        // Add group options
        groups.forEach(group => {
            const option = document.createElement("option");
            option.value = group.airtable;
            option.textContent = group.name || "Ukjent navn";
            groupSelector.appendChild(option);
        });
    }

        listTeams(gTeam);
        listMatch(gMatchs); 
}

function groupSelectorChange(){
        listMatch(gMatchs);
        listTeams(gTeam)
}

function findGroupByDivision(divisionId) {
    // Find the division object in `gDivision` array by `divisionId`
    let division = gDivision.find(div => div.airtable === divisionId);

    // Return groups if division is found, otherwise return an empty array
    return division ? division.group || [] : [];
}

function listDivision(divisions) {
    const list = document.getElementById("divisionlistholder");
    list.replaceChildren(); // Clear previous content

    list.parentElement.querySelector(".rowcounter").textContent = `${divisions.length} stk.`;
    let tabelid = "tblY9xnfQ1y8dXTaA";
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisionrow");

    // Clear and prepare selectors
    const divisionSelector = document.getElementById("divisionSelector");
    divisionSelector.replaceChildren();

    // Add default option "Alle divisjoner"
    const defaultOptionTeam = document.createElement("option");
    defaultOptionTeam.value = "";
    defaultOptionTeam.textContent = "Alle divisjoner";
    divisionSelector.appendChild(defaultOptionTeam);
    gGroups = [];

    for (let division of divisions) {
        const rowelement = nodeelement.cloneNode(true);
        const divisionName = rowelement.querySelector(".name")
        divisionName.textContent = division.name || "Ukjent navn";
        divisionName.addEventListener("click", () => triggerEditInput(divisionName, division, "name", "text", tabelid));

        // Add groups
        const groupNode = rowelement.querySelector(".group");
        division.group.forEach(group => {
            const groupElement = groupNode.cloneNode(true);
            groupElement.querySelector(".groupname").textContent = group.name;
            groupNode.parentElement.appendChild(groupElement);
            gGroups.push(group);
        });
        groupNode.style.display = "none";

        // Add endplay
        const endNode = rowelement.querySelector(".endplay");
        division.endplay.forEach(endplay => {
            const endElement = endNode.cloneNode(true);
            endElement.querySelector(".endname").textContent = endplay.endplayname;
            endElement.querySelector(".endcount").textContent = endplay.finalecount;
            endNode.parentElement.appendChild(endElement);
        });
        endNode.style.display = "none";

        // Add row to list
        list.appendChild(rowelement);

        // Populate selectors with options
        const optionTeam = document.createElement("option");
        optionTeam.value = division.airtable;
        optionTeam.textContent = division.name || "Ukjent navn";
        divisionSelector.appendChild(optionTeam);

    }
}

function listTeams(teams) {
    // Get selected values from division and group selectors
    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;

    // Filter teams based on selected division and group
    const filteredTeams = teams.filter(team => {
        const matchesDivision = !divisionValue || team.division === divisionValue;
        const matchesGroup = !groupValue || team.group === groupValue;
        return matchesDivision && matchesGroup;
    });

    // Sort teams alphabetically by name
    filteredTeams.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB); // Alphabetical order
    });

    // Get the list holder and clear previous content
    const list = document.getElementById("teamlistholder");
    list.replaceChildren(); // Clear previous content

    let tabelid = "tbl3ta1WZBr6wKPSp";
    let Cluboptions = convertArrayToOptions(gClub,"name","airtable");
    let Divisionoptions = convertArrayToOptions(gDivision,"name","airtable");
    // Update row counter
    list.parentElement.querySelector(".rowcounter").textContent = `${filteredTeams.length} stk.`;

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".teamrow");

    for (let team of filteredTeams) {
        const rowelement = nodeelement.cloneNode(true);

        // Set team logo if available
        if (team.clublogo) {
            rowelement.querySelector(".teamlogo").src = team.clublogo;
        }

        // Set team details
        const teamName = rowelement.querySelector(".name")
        teamName.textContent = team.name || "Ukjent navn";
        teamName.addEventListener("click", () => triggerEditInput(teamName, team, "name", "text", tabelid));

        const teamInitial = rowelement.querySelector(".initialer")
        teamInitial.textContent = team.initials || "-";
        teamInitial.addEventListener("click", () => triggerEditInput(teamInitial, team, "initials", "text", tabelid));

        const teamClubName = rowelement.querySelector(".club");
        teamClubName.textContent = team.clubname || "Ukjent klubb";
        teamClubName.addEventListener("click", () => triggerEditDropdown(teamClubName, team, "club", Cluboptions, tabelid));


        const DivisionName = rowelement.querySelector(".division");
        DivisionName.textContent = team.divisionname || "Ukjent divisjon";
        DivisionName.addEventListener("click", () => triggerEditDropdown(DivisionName, team, "division", Divisionoptions, tabelid));

        rowelement.querySelector(".groupname").textContent = team.groupname || "-";

        // Append the row to the list
        list.appendChild(rowelement);
    }
}

function listMatch(matchs) {
    // Get selected values from division and group selectors
    const divisionValue = document.getElementById("divisionSelector").value;
    const groupValue = document.getElementById("groupSelector").value;
    const typeValue = document.getElementById("typeSelector").value;

    // Filter matches based on selected division and group
    const filteredMatches = matchs.filter(match => {
        const matchesDivision = !divisionValue || match.division === divisionValue;
        const matchesGroup = !groupValue || match.group === groupValue;
        const matchesType = !typeValue || match.typematch === typeValue;
        return matchesDivision && matchesGroup && matchesType;
    });

    // Sort matches by time
    filteredMatches.sort((a, b) => new Date(a.time) - new Date(b.time));

    // Get the list holder and clear previous content
    const list = document.getElementById("matchlistholder");
    list.replaceChildren(); // Clear previous content

    let tabelid = "tblrHBFa60aIdqkUu";

    // Update row counter
    list.parentElement.querySelector(".rowcounter").textContent = `${filteredMatches.length} stk.`;

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".matchrow");
    alertMessage = [];
    for (let match of filteredMatches) {
        list.appendChild(makeMatchrow(nodeelement,match,tabelid));
    }

    // Sjekk om det finnes meldinger i alertMessage
    if (alertMessage.length > 0) {
        // Kombiner alle meldingene med linjeskift
        const alertText = alertMessage.join("\n");
        
        // Vis alert med linjeskift mellom hver melding
        alert(alertText);

        // Tøm arrayet
        alertMessage = [];
    }

}

function makeMatchrow(nodeelement,match,tabelid,startopen){
        let rowelement = nodeelement.cloneNode(true);
        
        
        const Timeelement = rowelement.querySelector(".time")
        Timeelement.textContent = formatIsoDateName(match.time) || "Ukjent startdato";
        Timeelement.dataset.date = formatIsoDateValue(match.time);
        Timeelement.addEventListener("click", () => triggerEditInput(Timeelement, match, "time", "datetime-local", tabelid));
        
        const divisionName = rowelement.querySelector(".division")
        divisionName.textContent = match.divisionname || "Ukjent divisjon";
        if(!match.groupname && !match.team1 && !match.team2){
            //hvis ikke gruppe eller team er valgt skal en kunne velge divisjon
        let Divisionoptions = convertArrayToOptions(gDivision,"name","airtable");
        divisionName.addEventListener("click", () => triggerEditDropdown(divisionName, match, "division", Divisionoptions, tabelid));
        }
        
        const groupName = rowelement.querySelector(".groupname")
        groupName.textContent = match.groupname || "-";

        //Gruppevelger
        if(!match.endplay && !match.type && match.division){
            //skal kunne velges om det ikke er en slutspillkamp og divisjon er valgt
            let Division = gDivision.find(item => item.airtable === match.division);
            let Groupoptions = convertArrayToOptions(Division.group,"name","airtable");
            
            //sjekker teamene er på kampen og at det stemmer
            const team1 = gTeam.find(item => item.airtable === match.team1);
            const team2 = gTeam.find(item => item.airtable === match.team2);

            if(team1 && team2){
            //to lag lagt til kampen
            
                if (team1.group == team2.group) {
                    // Samme gruppe på begge lag
                    Groupoptions = [{ text: team1.groupname, value: team1.group }];

                    // Fjern border fra raden
                    rowelement.style.border = "none";
                } else {
                    // Lagene tilhører forskjellige grupper
                    let thisMessage = "Lagene på kamp nr: " + match.nr + " tilhører forskjellige grupper.";
                    alertMessage.push(thisMessage);

                    // Legg til rød border med 2px på raden
                    rowelement.style.border = "2px solid red";
                }

            }else if(team1){
                //bare team 1
                Groupoptions = [{text:team1.groupname,value:team1.group}];
            }else if(team2){
                //bare team 2
                Groupoptions = [{text:team2.groupname,value:team2.group}];
            }

            //legger til for å fjerne kamp fra gruppe
            Groupoptions.push({text:"Ingen gruppe",value:""});
            groupName.addEventListener("click", () => triggerEditDropdown(groupName, match, "group", Groupoptions, tabelid));  
        }

        //Finne aktuelle team å velge til kampen
        let TeamOptions = [];
        let teamsInDivisionAndGroup = [];
        if(match.team1 || match.team1){
            //det er et av teamene som er lagt inn i kampen
            let teamObject;
            if(match.typematch){
                //er det en finalekamp alle team i denne divisjon
                teamsInDivisionAndGroup = gTeam.filter(team => {
                    return team.division === match.division;
                });

            }else{

                if(match.team1){
                    //hente opplysninger om divisjon og evt grupper fra team 1
                    teamObject = gTeam.find(item => item.airtable === match.team1);
                }else{
                    //hente opplysninger om divisjon og evt grupper fra team 2
                    teamObject = gTeam.find(item => item.airtable === match.team2);
                }
                teamsInDivisionAndGroup = gTeam.filter(team => {
                    return team.division === teamObject.division && (!teamObject.group || team.group === teamObject.group);
                });
            }
        }else{
            // ingen team er lagt til kampen finn alle team som tilhører match.division og eventuelt match.group
            teamsInDivisionAndGroup = gTeam.filter(team => {
                return team.division === match.division && (!match.group || team.group === match.group);
            });
        }
        TeamOptions = convertArrayToOptions(teamsInDivisionAndGroup,"name","airtable");
        TeamOptions.unshift({text:"Ingen lag",value:""});


        //team 1 velger
        const teamName1 = rowelement.querySelector(".team1name");
        teamName1.textContent = match.team1name || match.placeholderteam1 || "Ingen lag";
        if(TeamOptions.length >1){
        teamName1.addEventListener("click", () => triggerEditDropdown(teamName1, match, "team1", TeamOptions, tabelid));
        }
        if (match.team1clublogo) {rowelement.querySelector(".team1logo").src = match.team1clublogo};
        
        // Team 2 velger
        const teamName2 = rowelement.querySelector(".team2name")
        teamName2.textContent = match.team2name || match.placeholderteam2 || "Ingen lag";
        if(TeamOptions.length >1){
        teamName2.addEventListener("click", () => triggerEditDropdown(teamName2, match, "team2", TeamOptions, tabelid));
        }
        if (match.team2clublogo) {rowelement.querySelector(".team2logo").src = match.team2clublogo};

        //Scorfelt1
        const goal1 = rowelement.querySelector(".goalteam1");
        goal1.textContent = match.goalteam1 || "-";
        goal1.addEventListener("click", () => triggerEditInput(goal1, match, "goalteam1", "number", tabelid));

        //Scorfelt2
        const goal2 = rowelement.querySelector(".goalteam2");
        goal2.textContent = match.goalteam2 || "-";
        goal2.addEventListener("click", () => triggerEditInput(goal2, match, "goalteam2", "number", tabelid));

        //Result lable
        const ResultStatus = rowelement.querySelector(".resultstatus");
        let MatchTypeoptions = [
            { text: "Ingen", value: "" },
            { text: "Åttendedelsfinale", value: "eighthfinale" },
            { text: "Kvartfinale", value: "quarterfinale" },
            { text: "Semifinale", value: "semifinale" },
            { text: "Finale", value: "finale" }
            ];

        if(match.goalteam1 && match.goalteam2){
            ResultStatus.textContent = "Resultat";
            ResultStatus.classList.add("played");
        }else{
            ResultStatus.textContent = "Ikke spilt";
        }
        //finalekamp farge og tekst
        if(match.typematch){
            ResultStatus.textContent = MatchTypeoptions.find(option => option.value === match.typematch)?.text || "-";
            // Legg til border med farge og størrelse
            ResultStatus.style.borderColor = "#ffb700"; // Border-farge
            ResultStatus.style.borderWidth = "1px";     // Border-størrelse
            ResultStatus.style.borderStyle = "solid";   // Border-stil
        }else{
            ResultStatus.style.borderStyle = "none";   // Border-stil
        }
        //bane tekst
        const fieldName = rowelement.querySelector(".field");
        fieldName.textContent = match.fieldname || "-";
        fieldName.addEventListener("click", () => triggerEditInput(fieldName, match, "fieldname", "text", tabelid));

        //lokasjonstekst
        const loaction = rowelement.querySelector(".location");
        loaction.textContent = match.location || "-";
        loaction.addEventListener("click", () => triggerEditInput(loaction, match, "location", "text", tabelid));

        //Dommer tekst
        const refereeName = rowelement.querySelector(".refereename");
        refereeName.textContent = match.refereename || "-";
        refereeName.addEventListener("click", () => triggerEditInput(refereeName, match, "refereename", "text", tabelid));

        //Type kamp text
        const typeMatch = rowelement.querySelector(".type");
        typeMatch.textContent = MatchTypeoptions.find(option => option.value === match.typematch)?.text || "-";
       
        //Sluttspill text
        const endplay = rowelement.querySelector(".endplay");
        endplay.textContent = match.endplay || "-";

        //Finalenummer
        const endplayplace = rowelement.querySelector(".finalenr");
        endplayplace.textContent = match.endplayplace || "-";
        endplayplace.addEventListener("click", () => triggerEditInput(endplayplace, match, "endplayplace", "number", tabelid));

        //Kampnummer
        const matchnr = rowelement.querySelector(".matchnr");
        matchnr.textContent = match.nr || "-";

        //om det er valgt gruppe i kampen
        if(match.group && !match.endplay){
            // kampen har en gruppe og sluttspilldelen skal skjules
            endplayplace.parentElement.style.display = "none";
            typeMatch.parentElement.style.display = "none";
            endplay.parentElement.style.display = "none";
        }else{
            //sluttspil A eller B
            const endplayOptions = [{text:"A",value:"A"},{text:"B",value:"B"},{text:"Ingen",value:""}];
            endplay.addEventListener("click", () => triggerEditDropdown(endplay, match, "endplay", endplayOptions, tabelid));
            
            //finalenr
            if(match.endplay){
                endplayplace.addEventListener("click", () => triggerEditInput(endplayplace, match, "endplayplace", "number", tabelid));
            }

            //type kamp åttendedels,kvart,semi,finale 
            typeMatch.addEventListener("click", () => triggerEditDropdown(typeMatch, match, "typematch", MatchTypeoptions, tabelid));
        }

        const openButton = rowelement.querySelector(".infobutton");
        const allInfoMatch = rowelement.querySelector(".allinfomatch");
        const contentinfomatch = allInfoMatch.querySelector(".contentinfomatch");
        //starter skjult
        if(startopen){
        allInfoMatch.style.display = "block";
        }else{
        allInfoMatch.style.display = "none"; 
        }

    // Sjekk hvilken sport det er
        const volleyballDivbox = allInfoMatch.querySelector(".volleyballresults");
        const icehockeyDivbox = allInfoMatch.querySelector(".icehockey");
        volleyballDivbox.style.display = "none";
        icehockeyDivbox.style.display = "none";

        if (activetournament.sport[0] === "recSCesi2BGmCyivZ") {
            // Det er volleyball
            volleyballDivbox.style.display = "flex";

            const settAa = volleyballDivbox.querySelector(".settaa");
            settAa.textContent = match.settaa || "-";
            settAa.addEventListener("click", () => triggerEditInput(settAa, match, "settaa", "number", tabelid));

            const settAb = volleyballDivbox.querySelector(".settab");
            settAb.textContent = match.settab || "-";
            settAb.addEventListener("click", () => triggerEditInput(settAb, match, "settab", "number", tabelid));

            const settBa = volleyballDivbox.querySelector(".settba");
            settBa.textContent = match.settba || "-";
            settBa.addEventListener("click", () => triggerEditInput(settBa, match, "settba", "number", tabelid));

            const settBb = volleyballDivbox.querySelector(".settbb");
            settBb.textContent = match.settbb || "-";
            settBb.addEventListener("click", () => triggerEditInput(settBb, match, "settbb", "number", tabelid));


            const settCa = volleyballDivbox.querySelector(".settca");
            settCa.textContent = match.settca || "-";
            settCa.addEventListener("click", () => triggerEditInput(settCa, match, "settca", "number", tabelid));

            const settCb = volleyballDivbox.querySelector(".settcb");
            settCb.textContent = match.settcb || "-";
            settCb.addEventListener("click", () => triggerEditInput(settCb, match, "settcb", "number", tabelid));

            // Sjekk om det finnes noen settverdier
            const hasSetValues = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb]
                .some(value => value && value.trim() !== "");

            if (hasSetValues) {
                // Regne ut stillingen basert på settverdiene
                const sets = [
                    { teamA: match.settaa, teamB: match.settab },
                    { teamA: match.settba, teamB: match.settbb },
                    { teamA: match.settca, teamB: match.settcb },
                ];

                let teamAWins = 0;
                let teamBWins = 0;

                sets.forEach(set => {
                    const teamA = parseInt(set.teamA) || 0;
                    const teamB = parseInt(set.teamB) || 0;

                    if (teamA > teamB) {
                        teamAWins++;
                    } else if (teamB > teamA) {
                        teamBWins++;
                    }
                });

                goal1.textContent = teamAWins;
                goal2.textContent = teamBWins;
            } 
        }else if(activetournament.sport[0] === "reca0jxxTQAtlUTNu"){
            // det er icehockey
            icehockeyDivbox.style.display = "flex";

            const switsjOvertime = icehockeyDivbox.querySelector(".overtime");
            switsjOvertime.checked = !!match.overtime; // Konverter til boolean for sikkerhet
            
            // Legg til eventlistener for å håndtere klikk
            switsjOvertime.addEventListener("change", () => {
                triggerEditCheckbox(switsjOvertime,match,"overtime",tabelid);
            });

            const switsjshootout = icehockeyDivbox.querySelector(".shootout");
            switsjshootout.checked = !!match.overtime;
            
            switsjshootout.addEventListener("change", () => {
                triggerEditCheckbox(switsjshootout,match,"shootout",tabelid);
            });
        }
        //

        openButton.addEventListener("click", () => {
            if (allInfoMatch) {
                if (allInfoMatch.style.display === "block") {
                    // Skjul med fade ut først
                    allInfoMatch.style.transition = "opacity 0.3s ease-in-out";
                    allInfoMatch.style.opacity = "0";
        
                    // Etter fade, reduser høyden
                    setTimeout(() => {
                        allInfoMatch.style.transition = "height 0.3s ease-in-out";
                        const currentHeight = allInfoMatch.offsetHeight + "px"; // Få nåværende høyde
                        allInfoMatch.style.height = currentHeight; // Sett eksplisitt høyde før overgang
                        requestAnimationFrame(() => {
                            allInfoMatch.style.height = "0";
                        });
        
                        // Etter høydeanimasjon, skjul elementet
                        setTimeout(() => {
                            allInfoMatch.style.display = "none";
                        }, 400); // Match høydeovergangsvarighet
                    }, 300); // Match fade-varighet
        
                    openButton.classList.remove("open");
                    openButton.classList.add("close");
                } else {
                    // Vis med animasjon: først høyde, så fade inn
                    allInfoMatch.style.display = "block";
                    const targetHeight = allInfoMatch.scrollHeight + "px"; // Få innholdshøyde
                    allInfoMatch.style.height = "0"; // Start fra null høyde
                    allInfoMatch.style.opacity = "0";
                    allInfoMatch.style.transition = "height 0.3s ease-in-out";
                    requestAnimationFrame(() => {
                        allInfoMatch.style.height = targetHeight;
                    });
        
                    // Etter høydeanimasjon, fade inn
                    setTimeout(() => {
                        allInfoMatch.style.transition = "opacity 0.3s ease-in-out";
                        allInfoMatch.style.opacity = "1";
                    }, 300); // Match høydeovergangsvarighet
        
                    openButton.classList.remove("close");
                    openButton.classList.add("open");
                }
            }
        });
        
    
       // Finn synlige child-elementer (ikke display: none)
        const visibleChildren = Array.from(contentinfomatch.children).filter(
        (child) => window.getComputedStyle(child).display !== "none"
        );
        const columnCount = Math.ceil(Math.sqrt(visibleChildren.length));
        contentinfomatch.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
  

        // button panel
        const deletebutton = rowelement.querySelector(".deletebutton");
        deletebutton.onclick = function () {
            const confirmation = window.confirm("Ønsker du å slette denne kampen?");
            if (confirmation) {
                DELETEairtable(baseId,tabelid,match.airtable,"matchdeletedresponse");
                rowelement.remove();
            } else {
            console.log("Sletting avbrutt.");
            }
        }

        const duplicatebutton = rowelement.querySelector(".duplicate");
        duplicatebutton.onclick = function () {
            const confirmation = window.confirm("Ønsker du å kopiere denne kampen?");
            if (confirmation) {
            copyMatch(duplicatebutton,match,tabelid); 
            } else {
            console.log("Kopiering avbrutt.");
            }
        };

    return rowelement




}

function copyMatch(button, match, tabelid) {
    // Finn den nåværende raden (rowelement) ved å gå oppover i DOM
    const rowelement = button.parentElement.parentElement.parentElement;

    // Simuler klikk på infoknapp
    rowelement.querySelector(".infobutton").click();

    // Finn elementet som skal klones
    const elementlibrary = document.getElementById("elementlibrary");
    if (!elementlibrary) {
        console.error("Elementlibrary ikke funnet.");
        return;
    }

    const nodeelement = elementlibrary.querySelector(".copywait");
    if (!nodeelement) {
        console.error("Klonbart element ikke funnet i elementlibrary.");
        return;
    }

    // Klon og legg det inn i DOM
    const newRow = nodeelement.cloneNode(true);
    rowelement.parentElement.insertBefore(newRow, rowelement.nextSibling);
    copyMatchElementholder = newRow;

    // Kopier info fra match-objektet
    const newMatch = {
        division: [match.division],
        endplay: match.endplay,
        endplayplace: Number(match.endplayplace) || null,
        field: [match.field],
        fieldname: match.fieldname,
        group: [match.group],
        location: match.location,
        placeholderteam1: match.placeholderteam1,
        placeholderteam2: match.placeholderteam2,
        refereename: match.refereename,
        team1: [match.team1],
        team2: [match.team2],
        time: match.time || new Date().toISOString(), // Fallback hvis tid ikke er definert
        tournament: [match.tournament],
        typematch: match.typematch
    };

    // Fjern nøkler med tomme verdier, inkludert tomme arrays
    const cleanedMatch = Object.fromEntries(
        Object.entries(newMatch).filter(([_, value]) => {
            return (
                value !== null &&              // Ikke null
                value !== undefined &&         // Ikke undefined
                value !== "" &&                // Ikke tom streng
                !(Array.isArray(value) && (value.length === 0 || (value.length === 1 && value[0] === ""))) // Ikke tom array eller array med en tom streng
            );
        })
    );

    // Opprett en ny kamp på server
    POSTairtable(baseId, tabelid, JSON.stringify(cleanedMatch), "newMatchresponse");
}

function newMatchresponse(data) {
    // Sjekk for nødvendige elementer
    const elementlibrary = document.getElementById("elementlibrary");
    if (!elementlibrary) {
        console.error("Elementlibrary ikke funnet ved respons.");
        return;
    }

    const nodeelement = elementlibrary.querySelector(".matchrow");
    if (!nodeelement) {
        console.error("Klonbart matchrow-element ikke funnet.");
        return;
    }
    if(data.fields?.group){
    data.fields.group = data.fields.group[0];
    }
    gMatchs.push(data.fields);

    // Opprett ny rad basert på responsdata
    const newRow = makeMatchrow(nodeelement, data.fields, "tblrHBFa60aIdqkUu");

    // Erstatt midlertidig placeholder med den nye raden
    copyMatchElementholder.parentElement.insertBefore(newRow, copyMatchElementholder.nextSibling);
    copyMatchElementholder.remove();

    // Klikk på infoknappen i den nye raden
    newRow.querySelector(".infobutton").click();
}

function matchdeletedresponse(data){
   console.log(data);
}

