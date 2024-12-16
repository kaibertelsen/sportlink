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
const scrollPositions = Array.from(slides).map(() => 0); // Save scroll position for each slide

function updateSlidePosition() {
    swipeWrapper.style.transition = 'transform 0.3s ease';
    swipeWrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

function goToSlide(index) {
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
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
        }
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
        } else if (currentIndex === 1) {
            markActiveButton(document.getElementById('matchtabbutton'));
        } else if (currentIndex === 2) {
            markActiveButton(document.getElementById('endplaytabbutton'));
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


