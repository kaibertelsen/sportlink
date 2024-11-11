const swipeWrapper = document.querySelector('.swipe-wrapper');
const slides = document.querySelectorAll('.swipe-slide');
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
        // Lagre scroll-posisjonen til den nåværende siden
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;

        currentIndex = index;

        // Gjenopprett scroll-posisjonen til den nye aktive siden
        slides[currentIndex].scrollTop = scrollPositions[currentIndex];

        // Oppdater slide-posisjonen
        updateSlidePosition();

        // Innebygd logikk for å markere aktiv knapp
        if (currentIndex === 0) {
            markActiveButton(document.getElementById('tabeltabbutton'));
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
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

        updateSlidePosition();
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