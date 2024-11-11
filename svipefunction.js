let currentIndex = 0;
let startX = 0;
let startY = 0;  // Declare startY here
let currentX = 0; // Declare currentX here
let currentY = 0;
let translateX = 0;
let isDragging = false;
let isHorizontalSwipe = null;
const slideWidth = window.innerWidth;
const scrollPositions = Array.from(slides).map(() => 0);


// Update slide position with smooth transition
function updateSlidePosition() {
    swipeWrapper.style.transition = 'transform 0.3s ease';
    swipeWrapper.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

// Go to a specific slide and restore its scroll position
function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
        // Save the current slide's scroll position
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;

        // Update current index
        currentIndex = index;

        // Restore the new slide's scroll position
        slides[currentIndex].scrollTop = scrollPositions[currentIndex] || 0;

        // Update the slide's position in the wrapper
        updateSlidePosition();
        markActiveButtonBasedOnIndex();
    }
}

// Helper function to mark active button based on current index
function markActiveButtonBasedOnIndex() {
    if (currentIndex === 0) {
        markActiveButton(document.getElementById('tabeltabbutton'));
    } else if (currentIndex === 1) {
        markActiveButton(document.getElementById('matchtabbutton'));
    } else if (currentIndex === 2) {
        markActiveButton(document.getElementById('endplaytabbutton'));
    }
}

// Swipe functionality with touch events
function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    isDragging = true;
    isHorizontalSwipe = null;
    swipeWrapper.style.transition = 'none';
}

function handleTouchMove(event) {
    if (!isDragging) return;
    const deltaX = event.touches[0].clientX - startX;

    if (isHorizontalSwipe === null) {
        isHorizontalSwipe = Math.abs(deltaX) > Math.abs(event.touches[0].clientY - startY);
    }

    if (isHorizontalSwipe) {
        const translateX = -currentIndex * slideWidth + deltaX;
        swipeWrapper.style.transform = `translateX(${translateX}px)`;
    }
}

function handleTouchEnd() {
    if (!isDragging) return;
    const deltaX = currentX - startX;
    const threshold = slideWidth / 4;

    if (isHorizontalSwipe) {
        scrollPositions[currentIndex] = slides[currentIndex].scrollTop;
        
        if (deltaX < -threshold && currentIndex < slides.length - 1) {
            currentIndex++;
        } else if (deltaX > threshold && currentIndex > 0) {
            currentIndex--;
        }
        
        slides[currentIndex].scrollTop = scrollPositions[currentIndex] || 0;
        updateSlidePosition();
        markActiveButtonBasedOnIndex();
    }

    isDragging = false;
    isHorizontalSwipe = null;
}

// Add event listeners for swipe functionality
swipeWrapper.addEventListener('touchstart', handleTouchStart);
swipeWrapper.addEventListener('touchmove', handleTouchMove);
swipeWrapper.addEventListener('touchend', handleTouchEnd);

// Initial load
updateSlidePosition();