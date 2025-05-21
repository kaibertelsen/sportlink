const swipeWrapper = document.querySelector('.swipe-wrapper');
let slides = document.querySelectorAll('.swipe-slide');
let currentIndex = 0;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let translateX = 0;
let isDragging = false;
let isHorizontalSwipe = null;
const slideWidth = window.innerWidth;
const scrollPositions = Array.from(slides).map(() => 0); // Lagre scroll-posisjonen for hver slide

function updateSlidePosition() {
    swipeWrapper.style.transition = 'transform 0.3s ease';
    swipeWrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
        // Lagre scroll-posisjonen til den nåværende siden før vi bytter
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;

        // Oppdater gjeldende indeks
        currentIndex = index;

        // Gjenopprett scroll-posisjonen for den nye aktive siden
        slides[currentIndex].scrollTop = scrollPositions[currentIndex] || 0;

        // Oppdater slide-posisjonen (horisontal swipe)
        updateSlidePosition();

        // Marker aktiv knapp basert på currentIndex
        if (currentIndex === 0) {
            markActiveButton(document.getElementById('tabeltabbutton'));
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
        }else if (currentIndex === 3) {
            markActiveButton(document.getElementById('statisticstabbutton'));
        }
    }
}



// Håndter touch-start
function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    isDragging = true;
    isHorizontalSwipe = null;
    swipeWrapper.style.transition = 'none';
}

// Håndter touch-move
function handleTouchMove(event) {
    if (!isDragging) return;
    currentX = event.touches[0].clientX;
    currentY = event.touches[0].clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Bestem sveiperetningen hvis ikke allerede bestemt
    if (isHorizontalSwipe === null) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isHorizontalSwipe = true; // Lås til horisontal scrolling
            document.body.style.overflowY = 'hidden';
        } else {
            isHorizontalSwipe = false; // Lås til vertikal scrolling
        }
    }

    // Horisontal sveiping
    if (isHorizontalSwipe) {
        translateX = -currentIndex * slideWidth + deltaX;
        swipeWrapper.style.transform = `translateX(${translateX}px)`;
    }
}

// Håndter touch-end
function handleTouchEnd() {
    if (!isDragging) return;
    const deltaX = currentX - startX;
    const threshold = slideWidth / 4;

    // Hvis horisontal sveiping, bestem hvilken slide å navigere til
    if (isHorizontalSwipe) {
        // Lagre scroll-posisjonen til den nåværende siden
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;

        if (deltaX < -threshold && currentIndex < slides.length - 1) {
            currentIndex++;
        } else if (deltaX > threshold && currentIndex > 0) {
            currentIndex--;
        }

        // Gjenopprett scroll-posisjonen til den nye aktive siden
        slides[currentIndex].scrollTop = scrollPositions[currentIndex];

        // Oppdater slide-posisjonen
        updateSlidePosition();

        // Marker aktiv knapp basert på currentIndex
        if (currentIndex === 0) {
            markActiveButton(document.getElementById('tabeltabbutton'));
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
        }else if (currentIndex === 3) {
            markActiveButton(document.getElementById('statisticstabbutton'));
        }
    }

    // Tilbakestill verdier og lås opp vertikal scrolling
    isDragging = false;
    isHorizontalSwipe = null;
    document.body.style.overflowY = ''; // Lås opp vertikal scrolling
}


// Legg til touch-event listeners
swipeWrapper.addEventListener('touchstart', handleTouchStart);
swipeWrapper.addEventListener('touchmove', handleTouchMove);
swipeWrapper.addEventListener('touchend', handleTouchEnd);



// Initial oppdatering
updateSlidePosition();




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

    if (scroll && firstUnplayedMatch) {
        let scrollContainer = firstUnplayedMatch.parentElement;
        while (scrollContainer && scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
            scrollContainer = scrollContainer.parentElement;
        }

        if (scrollContainer) {
            setTimeout(() => {
                const targetPosition = firstUnplayedMatch.offsetTop - scrollContainer.offsetTop;
                scrollContainer.scrollTo({ top: targetPosition, behavior: "smooth" });

                setTimeout(() => {
                    scrollPositions[currentIndex] = scrollContainer.scrollTop;
                }, 500);
            }, 500);
        } else {
            setTimeout(() => {
                firstUnplayedMatch.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(() => {
                    scrollPositions[currentIndex] = window.scrollY;
                }, 500);
            }, 500);
        }
    }
}