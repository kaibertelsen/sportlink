const swipeWrapper = document.querySelector('.swipe-wrapper');
var slides = document.querySelectorAll('.swipe-slide');
let currentIndex = 0;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let translateX = 0;
let isDragging = false;
let isHorizontalSwipe = null;
const slideWidth = window.innerWidth;
const scrollPositions = Array.from(slides).map(() => 0); // Save scroll position for each slide

function updateSlidePosition() {
    swipeWrapper.style.transition = 'transform 0.3s ease';
    swipeWrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

function goToSlide(index) {
  slides = document.querySelectorAll('.swipe-slide');
    if (index >= 0 && index < slides.length) {
        // Save scroll position of the current slide
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;

        // Update current index
        currentIndex = index;

        // Restore scroll position for the new active slide
        slides[currentIndex].scrollTop = scrollPositions[currentIndex] || 0;

        // Update slide position (horizontal swipe)
        updateSlidePosition();

        // Mark active button based on currentIndex
        if (currentIndex === 0) {
            markActiveButton(document.getElementById('tabeltabbutton'));
            fadeInMatchSelector(false);
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
            fadeInMatchSelector(true);
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
            fadeInMatchSelector(false);
        }else if (currentIndex === 3) {
          markActiveButton(document.getElementById('statisticstabbutton'));
          fadeInMatchSelector(false);
        }
    }
}

function fadeElement(element, show = true, displayType = "block") {
  if (!element) return;

  element.style.transition = "opacity 0.5s";

  if (show) {
    element.style.display = displayType;
    element.style.opacity = "0";
    // Trigger reflow to apply transition
    void element.offsetWidth;
    element.style.opacity = "1";
  } else {
    element.style.opacity = "0";
    setTimeout(() => {
      element.style.display = "none";
    }, 500);
  }
}

function fadeInMatchSelector(type) {
  const selector = document.getElementById("matchMainListSelector");
  const dayfilterwrapper = document.getElementById("dayfilterwrapper");
  const filterstartbutton = document.getElementById("filterstartbutton");

  // Vis kampfilter hvis type er true (kampsiden)
  if (type) {
    fadeElement(selector.parentElement, true, "flex");
    fadeElement(dayfilterwrapper, true, "block");
    fadeElement(filterstartbutton, true, "inline-block");
  } else {
    fadeElement(selector.parentElement, false);
    fadeElement(dayfilterwrapper, false);
    fadeElement(filterstartbutton, false);
  }
}


// Handle touch start
function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    isDragging = true;
    isHorizontalSwipe = null;
    swipeWrapper.style.transition = 'none';
}

// Handle touch move
function handleTouchMove(event) {
    if (!isDragging) return;
    currentX = event.touches[0].clientX;
    currentY = event.touches[0].clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Determine swipe direction if not already determined
    if (isHorizontalSwipe === null) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isHorizontalSwipe = true; // Lock to horizontal scrolling
            document.body.style.overflowY = 'hidden';
        } else {
            isHorizontalSwipe = false; // Lock to vertical scrolling
        }
    }

    // Horizontal swiping
    if (isHorizontalSwipe) {
        translateX = -currentIndex * slideWidth + deltaX;
        swipeWrapper.style.transform = `translateX(${translateX}px)`;
    }
}

// Handle touch end
function handleTouchEnd() {
    if (!isDragging) return;
    const deltaX = currentX - startX;
    const threshold = slideWidth / 4;

    // If horizontal swipe, determine which slide to navigate to
    if (isHorizontalSwipe) {
        // Save scroll position of the current slide
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;

        if (deltaX < -threshold && currentIndex < slides.length - 1) {
            currentIndex++;
        } else if (deltaX > threshold && currentIndex > 0) {
            currentIndex--;
        }

        // Restore scroll position for the new active slide
        slides[currentIndex].scrollTop = scrollPositions[currentIndex];

        // Update slide position
        updateSlidePosition();

        // Mark active button based on currentIndex
        if (currentIndex === 0) {
            markActiveButton(document.getElementById('tabeltabbutton'));
            fadeInMatchSelector(false);
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
            fadeInMatchSelector(true);
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
            fadeInMatchSelector(false);
        }else if (currentIndex === 3) {
            markActiveButton(document.getElementById('statisticstabbutton'));
            fadeInMatchSelector(false);
      }
    }

    // Reset values and unlock vertical scrolling
    isDragging = false;
    isHorizontalSwipe = null;
    document.body.style.overflowY = ''; // Unlock vertical scrolling
}

// Add touch event listeners
swipeWrapper.addEventListener('touchstart', handleTouchStart);
swipeWrapper.addEventListener('touchmove', handleTouchMove);
swipeWrapper.addEventListener('touchend', handleTouchEnd);

// Initial update
updateSlidePosition();

//trigger for når en åpner appen igjen så oppdater tournament
function handleAppVisibility() {
  if (document.visibilityState === "visible") {
    console.log("Webappen er synlig igjen!");
    onAppResume(); // Kall funksjonen du vil kjøre når appen vises
  }
}

function onAppResume() {
  console.log("Oppdaterer innhold ved gjenåpning...");
  if(isInTurnament){
    updateThisTournament(null);
  }else{
    startFirstFunctions()
  }
}

// Legg til eventlistener for visibilitychange
document.addEventListener("visibilitychange", handleAppVisibility);

//oppdaterer når en scroller til toppen
function setupPullToRefresh(scrollElement, updateFunction) {
    const scrollParent = findScrollableParent(scrollElement); // Finn scrollelementet
    let isAtTop = false; // Om brukeren er på toppen av scrollen
    let touchStartY = 0; // Startpunkt for touch
    let pullDistance = 0; // Lagre trekkavstanden
  
    // Legg til scroll-hendelse på scrollelementet for å sjekke om vi er på toppen
    scrollParent.addEventListener("scroll", () => {
      isAtTop = scrollParent.scrollTop === 0; // Oppdater status for topp-posisjon
    });
  
    // Registrer startpunkt for brukeren når de begynner å dra
    scrollElement.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
      pullDistance = 0; // Tilbakestill trekkavstanden
    });
  
    // Beregn hvor langt brukeren drar ned
    scrollElement.addEventListener("touchmove", (e) => {
      if (isAtTop) { // Bare beregn trekkavstand hvis vi er på toppen
        const touchMoveY = e.touches[0].clientY;
        pullDistance = touchMoveY - touchStartY;
      }
    });
  
    // Sjekk om trekkavstanden er nok til å trigge oppdatering
    scrollElement.addEventListener("touchend", () => {
      if (isAtTop && pullDistance > 50) { // Krever både at vi er på toppen og at brukeren har dratt ned
        console.log("Oppdatering trigget!");
        updateFunction(scrollElement); // Kjør oppdateringsfunksjonen
      }
      pullDistance = 0; // Tilbakestill trekkavstanden
    });
}

function findScrollableParent(element) {
  while (element && element !== document.body) {
    const overflowY = window.getComputedStyle(element).overflowY;
    if (overflowY === "scroll" || overflowY === "auto") {
      return element; // Returner første foreldreelement med scroll-ansvar
    }
    element = element.parentElement; // Fortsett oppover i DOM-treet
  }
  return document.body; // Fall tilbake til document.body som siste utvei
}
// Oppdateringsfunksjoner for hver liste
function updateTeamsList(element) {
  updateThisTournament(element);
  console.log("Oppdaterer teams list:", element.id);
}

function updateMatchList(element) {
  updateThisTournament(element);
  console.log("Oppdaterer match list:", element.id);
}

function updateEndPlayList(element) {
  updateThisTournament(element);
  console.log("Oppdaterer end play list:", element.id);
}

// Sett opp Pull-to-Refresh for hver liste
setupPullToRefresh(document.getElementById("teamslistholder"), updateTeamsList);
setupPullToRefresh(document.getElementById("matchlistholder"), updateMatchList);
setupPullToRefresh(document.getElementById("endplaylist"), updateEndPlayList);

