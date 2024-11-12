function getMatch(data){
    var body = airtablebodylistAND({tournamentid:data.airtable,archived:0});
    Getlistairtable(baseId,"tblrHBFa60aIdqkUu",body,"getMatchresponse");
}

function getMatchresponse(data,id){
    matches = rawdatacleaner(data);
    listmatch(matches,"dato");
}

function groupArraybyDate(matchs){

        // Initialiser en ny array for grupperte kamper
        let grouparray = [];
        // Bruk reduce for å gruppere kampene etter dato
        let groupedByDate = matchs.reduce((groups, match) => {
            // Hent kun datoen fra 'time'-feltet (uten klokkeslett)
            let matchDate = new Date(match.time).toISOString().split('T')[0];

            // Hvis datoen ikke finnes i grupperingsobjektet, opprett en ny array for den datoen
            if (!groups[matchDate]) {
                groups[matchDate] = [];
            }

            // Legg til kampen i arrayen for den aktuelle datoen
            groups[matchDate].push(match);

            return groups;
        }, {});

        // Konverter objektet til en array med dato som nøkkel
        grouparray = Object.keys(groupedByDate).map(date => {
            return {
                date: date,
                matches: groupedByDate[date]
            };
        });
    

    return grouparray;
}


// listmatch function adjusted to avoid scroll conflicts
function listmatch(data, grouptype, scroll) {
    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    let matchs = sortDateArray(filteredMatches, "time");
    let grouparray = grouptype === "dato" ? groupArraybyDate(matchs) : [];

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');

    let firstUnplayedMatch = null;

    for (let item of grouparray) {
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".groupheadername").textContent = formatDateToNorwegian(item.date);
        const matchlist = rowelement.querySelector(".matchlist");
        const matchholder = rowelement.querySelector('.matchholder');

        for (let match of item.matches) {
            const matchelement = matchholder.cloneNode(true);
            matchlist.appendChild(matchelement);

            matchelement.onclick = function() {
                viewMatch(match);
            }

            matchelement.querySelector(".team1").textContent = match.team1name;
            matchelement.querySelector(".logoteam1").src = match.team1clublogo;
            matchelement.querySelector(".team2").textContent = match.team2name;
            matchelement.querySelector(".logoteam2").src = match.team2clublogo;

            const divisionlable = matchelement.querySelector(".divisionlable");
            if (activeDivision == "") {
                divisionlable.textContent = match.divisionname;
                divisionlable.style.color = mapColors("second");
            } else {
                divisionlable.style.display = "none";
            }

            const settlist = matchelement.querySelector(".settlist");
            const setKeys = ["sett1", "sett2", "sett3"];
            const hasRequiredSetScores = match.sett1 && match.sett2;

            if (hasRequiredSetScores) {
                settlist.style.display = "grid";
                const settdivnode = settlist.querySelector(".settdiv");
                let columnCount = 0;
                let team1SetsWon = 0;
                let team2SetsWon = 0;

                for (let i = 0; i < setKeys.length; i++) {
                    if (match[setKeys[i]]) {
                        const settdiv = settdivnode.cloneNode(true);
                        const setttextlable = settdiv.querySelector(".setttextlable");
                        setttextlable.textContent = match[setKeys[i]];

                        const [team1Score, team2Score] = match[setKeys[i]].split('-').map(Number);
                        if (team1Score > team2Score) team1SetsWon++;
                        else if (team2Score > team1Score) team2SetsWon++;

                        settlist.appendChild(settdiv);
                        columnCount++;
                    }
                }

                settdivnode.remove();
                settlist.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

                match.goalteam1 = team1SetsWon;
                match.goalteam2 = team2SetsWon;
                settlist.style.display = "none";
            } else {
                settlist.style.display = "none";
            }

            const resultlable = matchelement.querySelector(".resultlable");
            if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
                resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
                resultlable.style.fontWeight = "bold";
                resultlable.style.color = mapColors("main");
                resultlable.style.fontSize = "16px";
            } else {
                resultlable.textContent = formatdatetoTime(match.time);
                resultlable.style.fontWeight = "normal";

                if (!firstUnplayedMatch) {
                    firstUnplayedMatch = matchelement;
                }
            }

            if (item.matches.indexOf(match) === item.matches.length - 1) {
                matchelement.style.borderBottom = 'none';
            }

            matchlist.appendChild(matchelement);
        }

        matchholder.remove();
        list.appendChild(rowelement);
    }

    if (firstUnplayedMatch) {
        const swipeListContainer = firstUnplayedMatch.closest('.swipe-container-list');
    
        if (swipeListContainer) {
            const scrollToFirstMatch = () => {
                const elementTop = firstUnplayedMatch.getBoundingClientRect().top;
                const containerTop = swipeListContainer.getBoundingClientRect().top;
                const offset = elementTop - containerTop - (swipeListContainer.clientHeight / 2);
    
                swipeListContainer.scrollTo({
                    top: swipeListContainer.scrollTop + offset,
                    behavior: 'smooth',
                });
            };
    
            // Bruk `requestAnimationFrame` og en ekstra forsinkelse for å sikre at layout er oppdatert
            setTimeout(() => {
                requestAnimationFrame(scrollToFirstMatch);
            }, 300);
        }
    }
    
    
    
}

function viewMatch(match){

    const header = document.getElementById("headerwrappermatch");
        header.querySelector(".team1").textContent = match.team1name;
        header.querySelector(".logoteam1").src = match.team1clublogo;
        header.querySelector(".team2").textContent = match.team2name;
        header.querySelector(".logoteam2").src = match.team2clublogo;

    const resultlable = header.querySelector(".resultlablemacth");
    if (typeof match.goalteam1 !== "undefined" && typeof match.goalteam2 !== "undefined") {
        resultlable.textContent = `${match.goalteam1} - ${match.goalteam2}`;
        resultlable.style.fontWeight = "bold";
        resultlable.style.color = mapColors("main");
    } else {
        resultlable.textContent = formatdatetoTime(match.time);
        resultlable.style.fontWeight = "normal";
        resultlable.style.color = "white";
    }


    const matchinfo = document.getElementById("thismatchinfo");

    const updateTextContent = (selector, value) => {
        const element = matchinfo.querySelector(selector);
        if (value) {
            element.textContent = value;
            element.parentElement.style.display = "block";
        } else {
            element.parentElement.style.display = "none";
        }
        };
    
        // Oppdater matchinfo med sjekk for tomme eller manglende verdier
        updateTextContent(".turnamentname", match.tournament);
        matchinfo.querySelector(".icon").src = activetournament.icon;
        updateTextContent(".field", match.fieldname);
        updateTextContent(".refereename", match.refereename);

        const timeelement = matchinfo.querySelector(".datetime");
        timeelement.textContent = formatdatetoDateAndTime(match.time)
        
        const calendeicon = matchinfo.querySelector(".calendeicon");
        createICSFile(calendeicon, match);


        const locationElement = matchinfo.querySelector(".location");
        if (match?.fieldlocation) {
            locationElement.parentElement.style.display = "block";
            // Opprett en link med hvit tekst
            locationElement.innerHTML = `<a href="${match.fieldlocation}" target="_blank" rel="noopener noreferrer" style="color: white;">Trykk her for veibeskrivelse</a>`;
        } else {
            locationElement.textContent = "";
            locationElement.parentElement.style.display = "none";
        }
        

       
    const streaming = document.getElementById("streaminggroup");
        if(match?.streaminglink) {
            

            streaming.querySelector(".streaminginfo").textContent = "Kampen sendes "+formatdatetoDateAndTime(match.time);
            streaming.style.display = "block";
            /*
            const iframe = document.getElementById('youtube-iframe');
            const url = new URL(shortURL);
            const videoID = url.pathname.split('/')[1]; // Henter video-ID fra path
            // Sett ny src for iframe med riktig embed URL
            const embedURL = `https://www.youtube.com/embed/${videoID}`;
            iframe.src = embedURL;
            */
        } else {

            streaming.style.display = "none";

        }

    const fieldmap = document.getElementById("fieldmapwrapper");
        if(match?.fieldimage){
            fieldmap.style.display = "block";
            fieldmap.querySelector(".fieldname").textContent = match.fieldname;
            fieldmap.querySelector(".fieldimage").src = match.fieldimage;
        }else{
            fieldmap.style.display = "none";
        }
        

    document.getElementById("thismatchtabbutton").click();
}


function createICSFile(icon, match) {
    const startDate = new Date(match.time).toISOString().replace(/-|:|\.\d+/g, "").split(".")[0] + "Z";
    const endDate = new Date(new Date(match.time).getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, "").split(".")[0] + "Z"; // 1 time varighet
    const eventTitle = `Kamp ${match.goalteam1 ?? ""} - ${match.goalteam2 ?? ""}`.trim();
    const location = match.location || "";
    const description = match.tournament || "Kamp";

    // Lag innhold for .ics-fil
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventTitle}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR
`.trim();

    // Lag en Blob for .ics-filen
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    // Lag et <a>-element for nedlasting
    const link = document.createElement("a");
    link.href = url;
    link.download = "event.ics";
    link.textContent = "Legg til i kalender";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    // Legg lenken til 'icon' elementet
    icon.innerHTML = ""; // Fjern eksisterende innhold
    icon.appendChild(link);
}


