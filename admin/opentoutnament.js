
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
    document.getElementById("groupSelectorTeam").style.display = "none";
    document.getElementById("groupSelectorMatch").style.display = "none";

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

function divisionSelectorChange(selectorId) {
    
    // Find the selected division ID
    let divId = "";
    let listTeamsObject = false;
    if (selectorId === "groupSelectorTeam") {
        // Check division value on the team page
        divId = document.getElementById("divisionSelectorTeam").value;
        listTeamsObject = true;
    } else {
        // Check division value on the match page
        divId = document.getElementById("divisionSelectorMatch").value;
        listTeamsObject = false;
    }

    // Populate the groupSelector dropdown
    const groupSelector = document.getElementById(selectorId);

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


    if(listTeamsObject){
    // Update the team list
        listTeams(gTeam);
    }else{
        listMatch(gMatchs); 
    }
   
}

function groupSelectorChange(listName){
    if(listName == "Match"){
        listMatch(gMatchs);
    }else{
        listTeams(gTeam)

    }
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
    const divisionSelectorTeam = document.getElementById("divisionSelectorTeam");
    const divisionSelectorMatch = document.getElementById("divisionSelectorMatch");
    divisionSelectorTeam.replaceChildren();
    divisionSelectorMatch.replaceChildren();

    // Add default option "Alle divisjoner"
    const defaultOptionTeam = document.createElement("option");
    defaultOptionTeam.value = "";
    defaultOptionTeam.textContent = "Alle divisjoner";
    divisionSelectorTeam.appendChild(defaultOptionTeam);

    const defaultOptionMatch = document.createElement("option");
    defaultOptionMatch.value = "";
    defaultOptionMatch.textContent = "Alle divisjoner";
    divisionSelectorMatch.appendChild(defaultOptionMatch);

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
        divisionSelectorTeam.appendChild(optionTeam);

        const optionMatch = document.createElement("option");
        optionMatch.value = division.airtable;
        optionMatch.textContent = division.name || "Ukjent navn";
        divisionSelectorMatch.appendChild(optionMatch);
    }
}

function listTeams(teams) {
    // Get selected values from division and group selectors
    const divisionValue = document.getElementById("divisionSelectorTeam").value;
    const groupValue = document.getElementById("groupSelectorTeam").value;

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
    const divisionValue = document.getElementById("divisionSelectorMatch").value;
    const groupValue = document.getElementById("groupSelectorMatch").value;

    // Filter matches based on selected division and group
    const filteredMatches = matchs.filter(match => {
        const matchesDivision = !divisionValue || match.division === divisionValue;
        const matchesGroup = !groupValue || match.group === groupValue;
        return matchesDivision && matchesGroup;
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

    
    for (let match of filteredMatches) {
        const rowelement = nodeelement.cloneNode(true);

        const Timeelement = rowelement.querySelector(".time")
        Timeelement.textContent = formatIsoDateName(match.time) || "Ukjent startdato";
        Timeelement.dataset.date = formatIsoDateValue(match.time);
        Timeelement.addEventListener("click", () => triggerEditInput(Timeelement, match, "time", "datetime-local", tabelid));
        
        const divisionName = rowelement.querySelector(".division")
        divisionName.textContent = match.divisionname || "Ukjent divisjon";
        if(!match.groupname || !match.teamName1 || !match.teamName1){
            //hvis ikke gruppe eller team er valgt er satt skal en kunne hvelge divisjon
        let Divisionoptions = convertArrayToOptions(gDivision,"name","airtable");
        divisionName.addEventListener("click", () => triggerEditDropdown(divisionName, match, "division", Divisionoptions, tabelid));
        }
        
        const groupName = rowelement.querySelector(".groupname")
        groupName.textContent = match.groupname || "-";
        if(!match.endplay || !match.type ){
            //skal kunne velges om det ikke er en slutspillkamp og ikke er lag meg grupper
            
            
            //tilhører teamene en gruppe
            let teamshaveNoGroup = true;
            const team1 = gTeam.find(item => item.airtable === match.team1);
            const team2 = gTeam.find(item => item.airtable === match.team2);

            if(team1?.group || team2?.group){
                teamshaveNoGroup = false;;
            }

            if(teamshaveNoGroup){
            const Division = gDivision.find(item => item.airtable === match.division);
            let Groupoptions = convertArrayToOptions(Division.group,"name","airtable");
            groupName.addEventListener("click", () => triggerEditDropdown(groupName, match, "group", Groupoptions, tabelid));
            }
        }

        // Finn alle team som tilhører match.division og eventuelt match.group
        const teamsInDivisionAndGroup = gTeam.filter(team => {
            return team.division === match.division && (!match.group || team.group === match.group);
        });
        let TeamOptions = convertArrayToOptions(teamsInDivisionAndGroup,"name","airtable");
        TeamOptions.unshift({text:"Ingen lag",value:""});
        
        const teamName1 = rowelement.querySelector(".team1name");
        teamName1.textContent = match.team1name || match.placeholderteam1 || "Ingen lag";
        teamName1.addEventListener("click", () => triggerEditDropdown(teamName1, match, "team1", TeamOptions, tabelid));


        if (match.team1clublogo) {
            rowelement.querySelector(".team1logo").src = match.team1clublogo;
        }
        
        const goal1 = rowelement.querySelector(".goalteam1");
        goal1.textContent = match.goalteam1 || "-";
        goal1.addEventListener("click", () => triggerEditInput(goal1, match, "goalteam1", "number", tabelid));

        const goal2 = rowelement.querySelector(".goalteam2");
        goal2.textContent = match.goalteam2 || "-";
        goal2.addEventListener("click", () => triggerEditInput(goal2, match, "goalteam2", "number", tabelid));

        const ResultStatus = rowelement.querySelector(".resultstatus");
        if(match.goalteam1 && match.goalteam2){
            ResultStatus.textContent = "Resultat";
            ResultStatus.classList.add("played");
        }else{
            ResultStatus.textContent = "Ikke spilt";
        }


        if (match.team2clublogo) {
            rowelement.querySelector(".team2logo").src = match.team2clublogo;
        }

        const teamName2 = rowelement.querySelector(".team2name")
        teamName2.textContent = match.team2name || match.placeholderteam2 || "Ingen lag";
        teamName2.addEventListener("click", () => triggerEditDropdown(teamName2, match, "team2", TeamOptions, tabelid));

        const fieldName = rowelement.querySelector(".field");
        fieldName.textContent = match.fieldname || "-";
        fieldName.addEventListener("click", () => triggerEditInput(fieldName, match, "fieldname", "text", tabelid));

        const loaction = rowelement.querySelector(".location");
        loaction.textContent = match.location || "-";
        loaction.addEventListener("click", () => triggerEditInput(loaction, match, "location", "text", tabelid));

        const refereeName = rowelement.querySelector(".refereename");
        refereeName.textContent = match.refereename || "-";
        refereeName.addEventListener("click", () => triggerEditInput(refereeName, match, "refereename", "text", tabelid));

        const endplayplace = rowelement.querySelector(".finalenr");
        endplayplace.textContent = match.endplayplace || "-";
        if(match.endplay){
                //denne kan kun trykkes på om det er en sluttspilkamp
                endplayplace.addEventListener("click", () => triggerEditInput(endplayplace, match, "endplayplace", "number", tabelid));
        }

        let MatchTypeoptions = [
            { text: "Gruppekamp", value: "group" },
            { text: "Åttendedelsfinale", value: "eighthfinale" },
            { text: "Kvartfinale", value: "quarterfinale" },
            { text: "Semifinale", value: "semifinale" },
            { text: "Finale", value: "finale" }
             ];

        const typeMatech = rowelement.querySelector(".type")
        typeMatech.textContent = options.find(option => option.value === match.typematch) || "-";
        
        if(!match.group){
           typeMatech.addEventListener("click", () => triggerEditDropdown(typeMatech, match, "typematch", MatchTypeoptions, tabelid));
        }


        const endplay = rowelement.querySelector(".endplay")
        endplay.textContent = match.endplay || "-";



        
        rowelement.querySelector(".matchnr").textContent = match.nr || "-";

        const openButton = rowelement.querySelector(".infobutton");
        const allInfoMatch = rowelement.querySelector(".allinfomatch");
        //starter skjult
        allInfoMatch.style.display = "none";


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
        
        // Append the row to the list
        list.appendChild(rowelement);
    }
}








