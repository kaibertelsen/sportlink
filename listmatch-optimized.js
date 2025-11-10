
/* ==== Perf/UX helpers (prefikset for å unngå kollisjoner) ================== */

// Rask dato-nøkkel (YYYY-MM-DD) uten kostbare Date/ISO runder
function attx_isoDateKey(iso) {
  return (typeof iso === "string" && iso.length >= 10) ? iso.slice(0,10) : "ikke tidspunkt enda";
}

// Billig "pågår nå"-beregning (lokal tid), håndterer minutesPerPeriod * numberOfPeriods
function attx_computeIsPlaying(match, now = new Date()) {
  if (!match || !match.time || typeof match.time !== "string" || match.time.length < 16) return false;
  try {
    const y  = +match.time.slice(0,4);
    const mo = +match.time.slice(5,7) - 1;
    const d  = +match.time.slice(8,10);
    const hh = +match.time.slice(11,13);
    const mm = +match.time.slice(14,16);
    const start = new Date(y, mo, d, hh, mm, 0, 0); // lokal
    const diffMin = (now - start) / 60000;

    let total = 30;
    if (match.minutesPerPeriod && match.numberOfPeriods) {
      total = Number(match.minutesPerPeriod) * Number(match.numberOfPeriods);
    }
    return now > start && diffMin <= total;
  } catch {
    return false;
  }
}

// Pre-beregn felt som brukes ofte i lister (kalles én gang per last)
function attx_precomputeMatchFields(matchs) {
  const now = new Date();
  for (const m of (matchs || [])) {
    m._dateKey   = attx_isoDateKey(m.time);
    // Behold din egen formatfunksjon, men kall den én gang pr. kamp:
    m._timeLabel = m?.onlyday ? "" : formatdatetoTime(m.time);
    // Lett "pågår"-beregning
    m._isPlaying = attx_computeIsPlaying(m, now);
  }
  return matchs;
}

/* ==== Original vars ======================================================== */
var activeDayFilter = "";
var firstUnplayedMatch = null;

/* ==== Airtable load ======================================================== */
function getMatch(data){
    var body = airtablebodylistAND({tournamentid:data.airtable,archived:0});
    Getlistairtable(baseId,"tblrHBFa60aIdqkUu",body,"getMatchresponse");
}

function getMatchresponse(data,id){
    let matCH = rawdatacleaner(data);
    matches = calculateMatchResultBySett(matCH);

    // Pre-calc for bedre ytelse i UI
    matches = attx_precomputeMatchFields(matches);

    //list på nytt om ikke det alt er siden er lastet for 20sek siden
    listmatch(matches,"dato");
}

/* ==== Gruppering/filter ==================================================== */
function groupArraybyDate(matchs) {
    const groups = {};
    for (const match of (matchs || [])) {
      const key = match._dateKey || attx_isoDateKey(match.time);
      if (!groups[key]) groups[key] = { matches: [], timelable: null };
      groups[key].matches.push(match);
      if (match.timelable && !groups[key].timelable) groups[key].timelable = match.timelable;
    }
    return Object.keys(groups).sort().map(date => ({
      date,
      timelable: groups[date].timelable,
      matches: groups[date].matches
    }));
}

function groupArrayByLocation(matchs) {
    const groupedByLocation = (matchs || []).reduce((groups, match) => {
      const location = match.location && match.location.trim() !== "" ? match.location : "Ukjent lokasjon";
      (groups[location] ||= []).push(match);
      return groups;
    }, {});
    return Object.keys(groupedByLocation).map(location => ({
      location,
      matches: groupedByLocation[location]
    }));
}

function matchMainListSelectorChange(){
   listmatch(matches,"dato");
}

function filterMatchesByStatus(matchs) {
    const activeFilterButton = document.querySelector('#matchlistFilter .matchlist-tab.active');
    if (!activeFilterButton) return matchs;

    const filterValue = activeFilterButton.getAttribute('data-filter');
    const statusfilterMatchLable = document.getElementById("statusfilterMatchLable");

    if (filterValue === "all") {
        statusfilterMatchLable.textContent = "";
        return matchs;
    } else if (filterValue === "upcoming") {
        statusfilterMatchLable.textContent = "Kommende kamper";
        return (matchs || []).filter(match => !match.goalteam1 && !match.goalteam2);
    } else if (filterValue === "live" || filterValue === "ongoing") {
        statusfilterMatchLable.textContent = "Pågående kamper";
        return (matchs || []).filter(match => (match._isPlaying != null ? match._isPlaying : markMatchIfPlaying(match)));
    } else if (filterValue === "played") {
        statusfilterMatchLable.textContent = "Spilte kamper";
        return (matchs || []).filter(match =>
            match.goalteam1 !== undefined &&
            match.goalteam1 !== "" &&
            match.goalteam2 !== undefined &&
            match.goalteam2 !== ""
        );
    }
    return matchs;
}

/* ==== List launcher ======================================================== */
function listmatch(data, grouptype, scroll) {
    listmatchLayoutGrid(data, grouptype);
}

function removeAllExceptSpecific(listElement, keepElement) {
    for (let i = listElement.children.length - 1; i >= 0; i--) {
        const child = listElement.children[i];
        if (child !== keepElement) listElement.removeChild(child);
    }
}

function makeMatchInMatchHolder(data,matchlist,matchholder){
    const activeDivision = getActiveDivisionFilter();
    matchlist.parentElement.querySelector(".countermatch").textContent = data.length+" stk.";

    let filteredMatches = data;
    const matchlistSelector = matchlist.parentElement.querySelector(".locationselector");
    const selectorValue = matchlistSelector.value;
    if (selectorValue) {
        filteredMatches = filteredMatches.filter(match => match.location === selectorValue);
    }

    filteredMatches = filterDaybuttons(filteredMatches);

    removeAllExceptSpecific(matchlist, matchholder);

    // Batch-append for mindre jank
    const frag = document.createDocumentFragment();
    for (const match of (filteredMatches || [])) {
        const matchelement = makeMatchWrapper(matchholder, match,false);
        matchelement.style.display = "block";
        frag.appendChild(matchelement);
    }
    matchlist.appendChild(frag);
}

function locationSelectorInMatchlistChange(matches, matchlist, matchholder, selectedValue) {
    const filteredMatches = selectedValue === "" ? matches : matches.filter(match => match.location === selectedValue);
    makeMatchInMatchHolder(filteredMatches, matchlist, matchholder);
}

/* ==== Match view (optimalisert) =========================================== */
function viewMatch(match) {
    activematch = match;

    setTimeout(adjustMatchContainer, 500);

    const header = document.getElementById("headerwrappermatch");
    if (!header) return;

    const $h = (sel) => header.querySelector(sel);
    const headerTeam1 = $h(".team1");
    const headerTeam2 = $h(".team2");
    const headerLogo1 = $h(".logoteam1");
    const headerLogo2 = $h(".logoteam2");
    const resultLabel = $h(".resultlablemacth");
    const divisionLabel = $h(".divisionlablematch");
    const endplayLabel = $h(".endplaylablematch");
    const team1button = $h(".team1button");
    const team2button = $h(".team2button");
    const tournamentNameEl = $h(".turnamentname");

    const emptyLogo = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/675027cdbcf80b76571b1f8a_placeholder-teamlogo.png";

    const team1Name = match.team1name || match.placeholderteam1 || "-";
    const team2Name = match.team2name || match.placeholderteam2 || "-";

    let matchIsPlayed = false;
    let resultText = "";
    let resultWeight = "normal";
    let resultColor = "white";

    if ((match.goalteam1 === "" || match.goalteam1 === null) ||
        (match.goalteam2 === "" || match.goalteam2 === null)) {
      resultText = match?.onlyday ? "" : formatdatetoTime(match.time);
    } else {
      resultText = `${match.goalteam1} - ${match.goalteam2}`;
      resultWeight = "bold";
      resultColor = mapColors("main");
      matchIsPlayed = true;
    }

    const divisionText = `${match.divisionname || ""} ${match.groupname ? `- ${match.groupname}` : ""}`.trim();
    const hasDivision = Boolean(match?.divisionname);

    const matchTypeMap = {
      "round2":"Runde 2 kamper",
      "placementfinale":"Plasserings kamp",
      "eighthfinale": "8-delsfinale",
      "quarterfinale": "Kvartfinale",
      "semifinale": "Semifinale",
      "bronzefinale": "Bronsefinale",
      "finale": "Finale"
    };
    const hasEndplay = Boolean(match.typematch);
    const endplayText = hasEndplay
      ? `${match.endplay || ""}<br>${matchTypeMap[match.typematch] || "Ukjent sluttspill"}`
      : "";

    const matchsettholder = document.getElementById("thismatchsett");
    const setValues = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb];
    const setsAvailable = setValues.some(v => v != null && String(v).trim() !== "");

    const matchinfo = document.getElementById("thismatchinfo");
    const resultrapp = matchinfo ? matchinfo.querySelector(".resultrapp") : null;

    const streaming = document.getElementById("streaminggroup");
    const fieldmap = document.getElementById("fieldmapwrapper");

    requestAnimationFrame(() => {
      if (headerTeam1 && headerTeam1.textContent !== team1Name) headerTeam1.textContent = team1Name;
      if (headerTeam2 && headerTeam2.textContent !== team2Name) headerTeam2.textContent = team2Name;

      if (headerLogo1) headerLogo1.src = match.team1clublogo || emptyLogo;
      if (headerLogo2) headerLogo2.src = match.team2clublogo || emptyLogo;

      if (resultLabel) {
        if (resultLabel.textContent !== resultText) resultLabel.textContent = resultText;
        if (resultLabel.style.fontWeight !== resultWeight) resultLabel.style.fontWeight = resultWeight;
        if (resultLabel.style.color !== resultColor) resultLabel.style.color = resultColor;
      }

      if (divisionLabel) {
        const display = hasDivision ? "block" : "none";
        if (divisionLabel.style.display !== display) divisionLabel.style.display = display;
        const txt = hasDivision ? divisionText : "";
        if (divisionLabel.textContent !== txt) divisionLabel.textContent = txt;
      }

      if (endplayLabel) {
        const display = hasEndplay ? "block" : "none";
        if (endplayLabel.style.display !== display) endplayLabel.style.display = display;
        if (hasEndplay && endplayLabel.innerHTML !== endplayText) {
          endplayLabel.innerHTML = endplayText;
        }
      }

      if (team1button) {
        team1button.onclick = function () {
          const team1 = teams.find(t => t.airtable === match.team1);
          if (team1) { previouspage = "match"; viewteam(team1); }
        };
      }
      if (team2button) {
        team2button.onclick = function () {
          const team2 = teams.find(t => t.airtable === match.team2);
          if (team2) { previouspage = "match"; viewteam(team2); }
        };
      }

      if (tournamentNameEl && tournamentNameEl.textContent !== (match.tournamentname || "")) {
        tournamentNameEl.textContent = match.tournamentname || "";
      }

      if (matchsettholder) {
        const set = (cls, val) => {
          const el = matchsettholder.querySelector(cls);
          if (el) { const v = val || "-"; if (el.textContent !== v) el.textContent = v; }
        };
        set(".settaa", match.settaa);
        set(".settab", match.settab);
        set(".settba", match.settba);
        set(".settbb", match.settbb);
        set(".settca", match.settca);
        set(".settcb", match.settcb);

        const display = setsAvailable ? "block" : "none";
        if (matchsettholder.style.display !== display) matchsettholder.style.display = display;
      }

      if (resultrapp) {
        if (matchIsPlayed) {
          if (resultrapp.style.display !== "block") resultrapp.style.display = "block";
          let description = "Kampen er ferdig";
          if (match.overtime) description = "Kampen ble avgjort på overtid ⌛️";
          else if (match.shootout) description = "Kampen ble avgjort på straffekonkuranse";

          const md = resultrapp.querySelector(".matchdescription");
          if (md && md.textContent !== description) md.textContent = description;

          const notEnd = resultrapp.querySelector(".notendplaymatch");
          if (!match.typematch) {
            if (notEnd && notEnd.style.display !== "block") notEnd.style.display = "block";

            const logo1 = resultrapp.querySelector(".team1logo");
            const logo2 = resultrapp.querySelector(".team2logo");
            if (logo1) logo1.src = match.team1clublogo || emptyLogo;
            if (logo2) logo2.src = match.team2clublogo || emptyLogo;

            const points = pointGenerator(match.goalteam1, match.goalteam2, match.overtime, match.shootout, activetournament.sport[0]) || {};
            const t1p = resultrapp.querySelector(".team1points");
            const t2p = resultrapp.querySelector(".team2points");
            const t1txt = `${points?.team1point} poeng til ${match.team1name}`;
            const t2txt = `${points?.team2point} poeng til ${match.team2name}`;
            if (t1p && t1p.textContent !== t1txt) t1p.textContent = t1txt;
            if (t2p && t2p.textContent !== t2txt) t2p.textContent = t2txt;
          } else {
            const notEnd2 = resultrapp.querySelector(".notendplaymatch");
            if (notEnd2 && notEnd2.style.display !== "none") notEnd2.style.display = "none";
          }
        } else {
          if (resultrapp.style.display !== "none") resultrapp.style.display = "none";
        }
      }

      if (matchinfo) {
        const updateTextContent = (selector, value) => {
          const element = matchinfo.querySelector(selector);
          if (!element) return;
          const show = value != null && String(value).trim() !== "";
          if (show) {
            if (element.textContent !== value) element.textContent = value;
            if (element.parentElement && element.parentElement.style.display !== "block") {
              element.parentElement.style.display = "block";
            }
          } else if (element.parentElement && element.parentElement.style.display !== "none") {
            element.parentElement.style.display = "none";
          }
        };

        updateTextContent(".field", "Bane: " + (match.fieldname || ""));
        updateTextContent(".refereename", match.refereename || "");

        const timeelement = matchinfo.querySelector(".datetime");
        if (timeelement) {
          const timeText = match?.onlyday ? formatdatetoOnlyDate(match.time) : formatdatetoDateAndTime(match.time);
          if (timeelement.textContent !== timeText) timeelement.textContent = timeText;
        }

        const calendeicon = matchinfo.querySelector(".calendeicon");
        if (calendeicon) createICSFile(calendeicon, match);

        const locationElement = matchinfo.querySelector(".location");
        if (locationElement && locationElement.parentElement) {
          if (match?.fieldlocation) {
            if (locationElement.parentElement.style.display !== "block") locationElement.parentElement.style.display = "block";
            const href = match.fieldlocation;
            const existingA = locationElement.querySelector("a");
            const label = "Trykk her for veibeskrivelse";
            if (existingA) {
              if (existingA.getAttribute("href") !== href) existingA.setAttribute("href", href);
              if (existingA.textContent !== label) existingA.textContent = label;
              existingA.style.color = "white";
              existingA.target = "_blank";
              existingA.rel = "noopener noreferrer";
            } else {
              locationElement.innerHTML = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: white;">${label}</a>`;
            }
          } else if (match?.location) {
            if (locationElement.parentElement.style.display !== "block") locationElement.parentElement.style.display = "block";
            if (locationElement.textContent !== match.location) locationElement.textContent = match.location;
          } else {
            if (locationElement.textContent !== "") locationElement.textContent = "";
            if (locationElement.parentElement.style.display !== "none") locationElement.parentElement.style.display = "none";
          }
        }
      }

      if (streaming) {
        if (match?.streaminglink) {
          const info = streaming.querySelector(".streaminginfo");
          const txt = "Sendes " + formatdatetoDateAndTime(match.time);
          if (info && info.textContent !== txt) info.textContent = txt;
          if (streaming.style.display !== "block") streaming.style.display = "block";
        } else {
          if (streaming.style.display !== "none") streaming.style.display = "none";
        }
      }

      if (fieldmap) {
        if (match?.fieldimage) {
          if (fieldmap.style.display !== "block") fieldmap.style.display = "block";
          const nameEl = fieldmap.querySelector(".fieldname");
          const imgEl = fieldmap.querySelector(".fieldimage");
          if (nameEl && nameEl.textContent !== (match.fieldname || "")) nameEl.textContent = match.fieldname || "";
          if (imgEl) imgEl.src = match.fieldimage;
        } else {
          if (fieldmap.style.display !== "none") fieldmap.style.display = "none";
        }
      }

      const tabBtn = document.getElementById("thismatchtabbutton");
      if (tabBtn) tabBtn.click();

      requestAnimationFrame(() => {
        const matchlogConteinerviewer = document.getElementById("matchlogConteinerviewer");
        const infomaxGoalDiff = document.getElementById("infomaxGoalDiff");
        if (infomaxGoalDiff) {
          infomaxGoalDiff.style.display = "none";
          infomaxGoalDiff.textContent = "";
        }

        const resultOfLog = listLogForMatch(match, matchlogConteinerviewer, false) || {
          goalteam1: 0, goalteam2: 0
        };

        const g1raw = Number(resultOfLog.goalteam1) || 0;
        const g2raw = Number(resultOfLog.goalteam2) || 0;
        const diff = Math.abs(g1raw - g2raw);

        if (typeof maxGoalDiff === "number" && Number.isFinite(maxGoalDiff) && diff > maxGoalDiff) {
          if (infomaxGoalDiff) {
            infomaxGoalDiff.style.display = "block";
            infomaxGoalDiff.textContent = `Resultatet for denne kampen er justert til maks ${maxGoalDiff} mål i forskjell!`;
            infomaxGoalDiff.style.fontWeight = "bold";
            infomaxGoalDiff.style.color = "red";
          }
        } else if (infomaxGoalDiff) {
          infomaxGoalDiff.style.display = "none";
          infomaxGoalDiff.textContent = "";
          infomaxGoalDiff.style.color = "";
        }
      });
    });
}

/* ==== ICS / Layout utils =================================================== */
function createICSFile(icon, match) {
    const startDate = new Date(match.time);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 time varighet

    const formatDate = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);
    const eventTitle = `Kamp ${match.team1name ?? ""} - ${match.team2name ?? ""}`.trim();
    const location = match.location || "";
    const description = match.tournament || "Kamp";

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${eventTitle}
LOCATION:${location}
DESCRIPTION:${description}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR
`.trim();

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    icon.href = url;
    icon.download = "event.ics";
    icon.target = "_blank";
    icon.rel = "noopener noreferrer";
}

function adjustMatchContainer() {
    const headerWrapper = document.getElementById("headerwrappermatch");
    const swipeContainer = document.getElementById("matchcontentholder");

    if (headerWrapper && swipeContainer) {
        const headerHeight = headerWrapper.offsetHeight;

        const safeAreaInsetTop = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || 0
        );

        let paddingTop = headerHeight - safeAreaInsetTop;
        if (paddingTop < 150) paddingTop = 150;

        swipeContainer.style.paddingTop = `${paddingTop}px`;
    }
}

/* ==== Scoringskalkulasjon (uendret) ======================================= */
function calculateMatchResultBySett(matchs) {
    for (let match of matchs) {
        const hasSetValues = [match.settaa, match.settab, match.settba, match.settbb, match.settca, match.settcb]
            .some(value => value != null && value.toString().trim() !== "");

        if (hasSetValues) {
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

                if (teamA > teamB)      teamAWins++;
                else if (teamB > teamA) teamBWins++;
            });

            match.goalteam1 = teamAWins;
            match.goalteam2 = teamBWins;
        }
    }
    return matchs;
}

function calculateMatchResultByLog(matchs) {
    (matchs || []).forEach(match => {
      if (!match.matchlogg || match.matchlogg.length === 0) return;

      const team1 = match.team1;
      let goalteam1 = 0;
      let goalteam2 = 0;
      let penaltyminteam1 = 0;
      let penaltyminteam2 = 0;

      match.matchlogg.forEach(log => {
        const team = log.team;

        const eventPointer = Number(log.eventpoint);
        if (!isNaN(eventPointer) && eventPointer >= 0) {
          if (team === team1) goalteam1 += eventPointer;
          else                goalteam2 += eventPointer;
        }

        const isPenalty = log.eventtype === "recfYDgKdjfiDSO4g" || log.eventtype === "reclsQ8SpocBhDlsy";
        if (isPenalty) {
          const minutes = Number(log.penaltyminutes);
          if (!isNaN(minutes)) {
            if (team === team1) penaltyminteam1 += minutes;
            else                penaltyminteam2 += minutes;
          }
        }
      });

      const diff = Math.abs(goalteam1 - goalteam2);
      if (diff > maxGoalDiff) {
        if (goalteam1 > goalteam2) goalteam1 = goalteam2 + maxGoalDiff;
        else                       goalteam2 = goalteam1 + maxGoalDiff;
      }

      match.goalteam1 = goalteam1;
      match.goalteam2 = goalteam2;
      match.penaltyminteam1 = penaltyminteam1;
      match.penaltyminteam2 = penaltyminteam2;
    });

    return matchs;
}

/* ==== Layout Grid render =================================================== */
function listmatchLayoutGrid(data) {
    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);

    filteredMatches = filterMatchesByStatus(filteredMatches);
    filteredMatches = filterDaybuttons(filteredMatches);

    const matchs = sortDateArray(filteredMatches, "time");
    let grouparray = [];

    let locationView = false;
    let groupType = "dato";
    if (!activeDayFilter || activeDayFilter === ""){
        grouparray = groupArraybyDate(matchs);
    } else {
        grouparray = groupArrayByLocation(matchs);
        locationView = true;
        groupType = "location";
    }

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();

    if (filteredMatches.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.className = "empty-message";
        emptyMessage.textContent = "Ingen kamper";
        list.appendChild(emptyMessage);
        return;
    }

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholderlayoutgrid');

    firstUnplayedMatch = null;

    // Batch-append grupper i ett fragment
    const frag = document.createDocumentFragment();
    for (const item of grouparray) {
        const rowelement = makeGroupMatchWrapper(item,false,nodeelement,groupType);
        frag.appendChild(rowelement);
    }
    list.appendChild(frag);

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
            setTimeout(() => { requestAnimationFrame(scrollToFirstMatch); }, 300);
        }
    }
}

function makeGroupMatchWrapper(item,team,nodeelement,grouptype){
    const rowelement = nodeelement.cloneNode(true);

    const groupheadername = rowelement.querySelector(".groupheadername");
    const underlineheader = rowelement.querySelector(".underlineheader");
    const locationSelector = rowelement.querySelector(".locationselector");
    const closeopengroupbutton = rowelement.querySelector(".closeopengroupbutton");

    if (grouptype === "dato") {
        groupheadername.textContent = item.timelable
        ? item.timelable
        : (isNaN(Date.parse(item.date)) ? item.date : formatDateToNorwegian(item.date));

        if(locationSelector){
          loadLocationSelector(item.matches,locationSelector);
          locationSelector.addEventListener("change", () => {
              const selectedValue = locationSelector.value;
              locationSelectorInMatchlistChange(item.matches, matchlist,matchholder, selectedValue);
          });
        }

        underlineheader.style.display = "none";
        closeopengroupbutton.style.display = "none";
        locationSelector.style.display = "block";
    } else {
        groupheadername.textContent = item.location;
        locationSelector.style.display = "none";

        const date = (item.matches[0].time || "").split("T")[0];
        const dateString = formatDateToNorwegian(date);
        underlineheader.textContent = dateString;
        underlineheader.style.display = "block";

        closeopengroupbutton.style.display = "block";
        closeopengroupbutton.onclick = function() {
          toggleMatchList(rowelement, closeopengroupbutton);
        };
    }

    const countermatch = rowelement.querySelector(".countermatch");
    countermatch.textContent = item.matches.length+" stk.";

    const matchlist = rowelement.querySelector(".matchlist");
    const matchholder = rowelement.querySelector('.matchholder');
    const isOnlyOneLocation = findUnicLocations(item.matches).length === 1;

    // Batch-append matcher i fragment
    const frag = document.createDocumentFragment();
    for (const match of item.matches) {
        const matchelement = makeMatchWrapper(matchholder,match,team,grouptype,isOnlyOneLocation);
        if (item.matches.indexOf(match) === item.matches.length - 1) {
            matchelement.querySelector(".bordholder").style.borderBottom = 'none';
        }
        frag.appendChild(matchelement);
    }
    matchlist.appendChild(frag);

    matchholder.style.display = "none";
    return rowelement;
}

function makeMatchWrapper(nodeelement,match,team,grouptype,isOnlyOneLocation){
    const matchelement = nodeelement.cloneNode(true);

    const activeDivision = getActiveDivisionFilter();

    matchelement.onclick = function() {
        previouspage = "";
        viewMatch(match);
    };

    // Tidspunkt: bruk memo (kalkulert en gang)
    const matchTime = matchelement.querySelector(".timelable");
    matchTime.textContent = match._timeLabel || "";

    const resultlableteam1 = matchelement.querySelector(".resultlableteam1");
    resultlableteam1.textContent = match.goalteam1 != null ? match.goalteam1 : "";

    const resultlableteam2 = matchelement.querySelector(".resultlableteam2");
    resultlableteam2.textContent = match.goalteam2 != null ? match.goalteam2 : "";

    // Logoer med lazy
    const team1Logo = matchelement.querySelector(".logoteam1");
    const team2Logo = matchelement.querySelector(".logoteam2");
    if (team1Logo) {
      if (match.team1clublogo) team1Logo.src = match.team1clublogo;
      team1Logo.loading = "lazy";
    }
    if (team2Logo) {
      if (match.team2clublogo) team2Logo.src = match.team2clublogo;
      team2Logo.loading = "lazy";
    }

    // Lagnavn
    const team1Name = match.team1name || match.placeholderteam1 || "Unknown";
    const team2Name = match.team2name || match.placeholderteam2 || "Unknown";
    matchelement.querySelector(".team1").textContent = team1Name;
    matchelement.querySelector(".team2").textContent = team2Name;

    // Lokasjon
    const locationLabel = matchelement.querySelector(".locationtext");
    const fieldName = match.fieldname || "";
    const locationName = match.location || "";
    if (grouptype === "location" || isOnlyOneLocation) {
      locationLabel.textContent = "Bane: "+fieldName;
    } else {
      locationLabel.textContent = fieldName ? `${locationName} (${fieldName})` : locationName;
    }

    // Dommer
    const destinationlable = matchelement.querySelector(".refereename");
    destinationlable.textContent = match.refereename || "";

    // Sluttspill-lable
    const endplayLable = matchelement.querySelector(".endplaylable");
    if (match.typematch) {
        const matchTypeMap = {
            "eighthfinale": "ÅF",
            "placementfinale":"PK",
            "round2":"R2",
            "quarterfinale": "KF",
            "semifinale": "SF",
            "bronzefinale":"BF",
            "finale": "F"
        };
        const endplayText = matchTypeMap[match.typematch] || "Ukjent sluttspill";
        endplayLable.textContent = `${endplayText} - ${match.endplay || ""}`;
        endplayLable.style.display = "inline-block";
    } else {
        endplayLable.style.display = "none";
    }

    // Divisjonsnavn og gruppenavn
    const divisiontext = matchelement.querySelector(".divisiontext");
    const grouptext = matchelement.querySelector(".grouptext");
    if (activeDivision === "") {
        divisiontext.textContent = match.divisionname || "";
        grouptext.textContent = match.groupname || "";
    } else {
        divisiontext.textContent = "";
        grouptext.textContent = match.groupname || "";
    }

    const resultwrapper = matchelement.querySelector(".resultwrapper");

    if (match.goalteam1 == null || match.goalteam1 === "" ||
        match.goalteam2 == null || match.goalteam2 === "") {

        resultlableteam1.textContent = "-";
        resultlableteam2.textContent = "-";

        if (!firstUnplayedMatch) firstUnplayedMatch = matchelement;

        // Bruk memo hvis finnes, ellers fallback til din eksisterende funksjon
        const isMatchPlaying = (match._isPlaying != null) ? match._isPlaying : markMatchIfPlaying(match);
        const playIcon = matchelement.querySelector(".playicon");
        if (playIcon) playIcon.style.display = isMatchPlaying ? "block" : "none";
    }

    makeColorOnResult(team,match,resultwrapper);

    return matchelement;
}

/* ==== Fargelogikk (uendret) =============================================== */
function makeColorOnResult(team, match, resultLabel) {
    const goal1 = match.goalteam1 != null && match.goalteam1 !== "" ? parseInt(match.goalteam1) : null;
    const goal2 = match.goalteam2 != null && match.goalteam2 !== "" ? parseInt(match.goalteam2) : null;

    if (!team) {
        if (goal1 == null || goal2 == null) {
            resultLabel.style.backgroundColor = "#2c2c2d";
        } else {
            resultLabel.style.backgroundColor = "#0b344f";
        }
    } else {
        if (goal1 != null && goal2 != null) {
            const isTeam1 = match.team1 === team.airtable;
            const isTeam2 = match.team2 === team.airtable;

            if ((goal1 > goal2 && isTeam1) || (goal2 > goal1 && isTeam2)) {
                resultLabel.style.backgroundColor = "green";
            } else if (goal1 === goal2) {
                resultLabel.style.backgroundColor = "gray";
            } else {
                resultLabel.style.backgroundColor = "red";
            }
        } else {
            resultLabel.style.backgroundColor = "#2c2c2d";
        }
    }
}

/* ==== Playing status fallback (uendret) ==================================== */
function markMatchIfPlaying(match) {
    const now = new Date();

    if (!match.time) return false;

    try {
      const [datePart, timePart] = match.time.split("T");
      const cleanTime = timePart.split(".")[0];

      const matchDateTime = new Date(`${datePart}T${cleanTime}`);

      const nowLocal = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
      );

      const timeDifference = (nowLocal - matchDateTime) / (1000 * 60);

      let timePlaying = 30;
      if (match.minutesPerPeriod && match.numberOfPeriods) {
        timePlaying = Number(match.minutesPerPeriod) * Number(match.numberOfPeriods);
      }

      return nowLocal > matchDateTime && timeDifference <= timePlaying;

    } catch (err) {
      console.error("Feil ved parsing av kampdato:", err);
      return false;
    }
}

/* ==== Expand/collapse og filter UI (uendret utenom mikro-endringer) ======= */
function toggleMatchList(rowelement, closeopengroupbutton) {
    const matchlist = rowelement.querySelector(".matchlist");
    const headerdiv = rowelement.querySelector(".headerdiv");

    const activeFilterButton = document.querySelector('#matchlistFilter .matchlist-tab.active');
    const filterValue = activeFilterButton.getAttribute('data-filter');

    const isCollapsed = getComputedStyle(matchlist).display === "none" ||
                        getComputedStyle(matchlist).height === "0px";

    if (isCollapsed) {
        headerdiv.style.borderBottom = "1px solid #474747";

        matchlist.style.display = "block";
        const fullHeight = matchlist.scrollHeight + "px";

        matchlist.style.height = "0px";
        matchlist.style.overflow = "hidden";
        void matchlist.offsetWidth;

        matchlist.style.transition = "height 300ms ease";
        matchlist.style.height = fullHeight;

        setTimeout(() => {
          matchlist.style.height = "";
          matchlist.style.transition = "";
          matchlist.style.overflow = "";
        }, 300);

        closeopengroupbutton.style.transition = "transform 300ms ease";
        closeopengroupbutton.style.transform = "rotate(0deg)";
    } else {
        headerdiv.style.borderBottom = "none";

        const fullHeight = matchlist.scrollHeight + "px";

        matchlist.style.height = fullHeight;
        matchlist.style.overflow = "hidden";
        void matchlist.offsetWidth;

        matchlist.style.transition = "height 300ms ease";
        matchlist.style.height = "0px";

        setTimeout(() => {
          matchlist.style.display = "none";
          matchlist.style.height = "";
          matchlist.style.transition = "";
          matchlist.style.overflow = "";
        }, 300);

        closeopengroupbutton.style.transition = "transform 300ms ease";
        closeopengroupbutton.style.transform = "rotate(180deg)";
    }
}

function loadDayfilter(data) {
    const dayScrollContainer = document.getElementById('dayScrollContainer');
    if (!dayScrollContainer) return;

    dayScrollContainer.innerHTML = '';

    const dateSet = new Set();
    (data || []).forEach(match => {
        if (!match.time) return;
        const dateOnly = attx_isoDateKey(match.time);
        dateSet.add(dateOnly);
    });

    const sortedDates = Array.from(dateSet).sort();
    const dayNames = ['Søn.', 'Man.', 'Tir.', 'Ons.', 'Tor.', 'Fre.', 'Lør.'];
    const monthNames = ['jan', 'feb', 'mars', 'apr', 'mai', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'des'];

    let todayButton = null;
    let firstDateButton = null;

    let firstLoad = true;

    const setActiveButton = (targetButton, selectedDate) => {
        document.querySelectorAll('.day-button').forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
        activeDayFilter = selectedDate;

        if (!firstLoad) {
            listmatch(matches);
        }
    };

    const allButton = document.createElement('button');
    allButton.classList.add('day-button', 'active');
    allButton.innerHTML = `
      <span class="day-label">Alle</span>
      <span class="date-label">Dager</span>
    `;
    allButton.addEventListener('click', () => setActiveButton(allButton, ""));
    dayScrollContainer.appendChild(allButton);

    sortedDates.forEach(dateStr => {
        const d = new Date(dateStr);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();

        const dayLabel = isToday ? 'Idag' : dayNames[d.getDay()];
        const dateLabel = `${d.getDate()}. ${monthNames[d.getMonth()]}`;

        const button = document.createElement('button');
        button.classList.add('day-button');

        if (isToday) todayButton = button;
        if (!firstDateButton) firstDateButton = button;

        button.innerHTML = `
            <span class="day-label">${dayLabel}</span>
            <span class="date-label">${dateLabel}</span>
        `;
        button.addEventListener('click', () => setActiveButton(button, dateStr));
        dayScrollContainer.appendChild(button);
    });

    const buttonToClick = allButton || todayButton;
    if (buttonToClick) {
        setTimeout(() => {
            setActiveButton(buttonToClick, buttonToClick === allButton ? "" : sortedDates[0]);
            buttonToClick.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            firstLoad = false;
        }, 0);
    }
}

function filterDaybuttons(data) {
    if (!activeDayFilter || activeDayFilter === "") return data;
    const filterDate = attx_isoDateKey(activeDayFilter);
    return (data || []).filter(match => {
      if (!match.time) return false;
      const matchDate = match._dateKey || attx_isoDateKey(match.time);
      return matchDate === filterDate;
    });
}

function initDayFilterToggle() {
    const filterButton = document.getElementById('filterstartbutton');
    const dayFilterWrapper = document.getElementById('dayfilterwrapper');
    const matchlistholder = document.getElementById('matchlistholder');
    const statusfilterMatchLable = document.getElementById("statusfilterMatchLable");

    if (!filterButton || !dayFilterWrapper || !matchlistholder) return;

    let isExpanded = false;

    const originalHeight = 53;
    const expandedHeight = 103;

    const originalBottom = -53;
    const expandedBottom = -103;

    const computedStyle = window.getComputedStyle(matchlistholder);
    const originalPaddingTop = parseInt(computedStyle.paddingTop) || 0;

    const expandedPaddingTop = originalPaddingTop + (expandedHeight - originalHeight);

    dayFilterWrapper.style.height = `${originalHeight}px`;
    dayFilterWrapper.style.bottom = `${originalBottom}px`;
    dayFilterWrapper.style.overflow = 'hidden';
    dayFilterWrapper.style.transition = 'height 300ms ease, bottom 300ms ease';

    matchlistholder.style.transition = 'padding 300ms ease';

    const collapse = () => {
      isExpanded = false;
      let exsizeM = 0;
      let exsizeP = 0;
      if(statusfilterMatchLable.textContent !== ""){
        statusfilterMatchLable.style.display = "block";
        exsizeP = 15;
        exsizeM = -15;
      }

      dayFilterWrapper.style.height = `${originalHeight+exsizeP}px`;
      dayFilterWrapper.style.bottom = `${originalBottom+exsizeM}px`;
      matchlistholder.style.paddingTop = `${originalPaddingTop+exsizeP}px`;
    };

    filterButton.addEventListener('click', (e) => {
      e.preventDefault();
      isExpanded = !isExpanded;

      let exsizeM = 0;
      let exsizeP = 0;
      if(statusfilterMatchLable.textContent !== ""){
        exsizeP = 15;
        exsizeM = -15;
      }
      if (isExpanded) {
          statusfilterMatchLable.style.display = "none";
      } else {
          statusfilterMatchLable.style.display = "block";
      }
      dayFilterWrapper.style.height = isExpanded ? `${expandedHeight}px` : `${originalHeight+exsizeP}px`;
      dayFilterWrapper.style.bottom = isExpanded ? `${expandedBottom}px` : `${originalBottom+exsizeM}px`;
      matchlistholder.style.paddingTop = isExpanded ? `${expandedPaddingTop}px` : `${originalPaddingTop+exsizeP}px`;
    });

    const handleOutsideInteraction = (e) => {
      const isClickInside =
        dayFilterWrapper.contains(e.target) || filterButton.contains(e.target);
      if (!isClickInside) {
        collapse();
      }
    };

    // Add passive for touchstart to avoid Chrome violation
    document.addEventListener('click', handleOutsideInteraction);
    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });
}

// Ensure these functions are globally visible for other scripts that call them
window.loadDayfilter = loadDayfilter;
window.initDayFilterToggle = initDayFilterToggle;
window.listmatch = listmatch;
window.viewMatch = viewMatch;
window.getMatch = getMatch;
window.getMatchresponse = getMatchresponse;
window.resetMatchlistFilter = resetMatchlistFilter;
window.initMatchlistFilter = initMatchlistFilter;
