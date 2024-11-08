
document.getElementById('buttontoallturnering').onclick = function() {
    document.getElementById('taballturnering').click();
    //tøm listene i konkuransen
    emtyTurnamentLists();
}
    
document.getElementById('testtoturnering').onclick = function() {
    document.getElementById('tabtoturnering').click();
}
     
document.getElementById('headermaillogo').onclick = function() {
    location.reload();
}



// on turneringspage
document.getElementById('tabeltabbutton').onclick = function() {
    markActiveButton(document.getElementById('tabeltabbutton'));
    document.getElementById('loadtablebutton').click();
}

document.getElementById('matchtabbutton').onclick = function() {
    markActiveButton(document.getElementById('matchtabbutton'));
    document.getElementById('loadmatchbutton').click();
}

document.getElementById('endplaytabbutton').onclick = function() {
    markActiveButton(document.getElementById('endplaytabbutton'));
    document.getElementById('loadendplaybutton').click();
}


document.addEventListener("DOMContentLoaded", function() {
    const header = document.querySelector('.headerwrapper');

    // Hent opprinnelig høyde av headeren
    const originalHeight = header.offsetHeight;

    document.addEventListener("scroll", function() {
        const scrollPosition = window.scrollY;

        // Krymp headeren når brukeren scroller mer enn 50px ned
        if (scrollPosition > 50) {
            header.style.height = `${originalHeight / 2}px`; // Sett høyden til 50% av opprinnelig
            header.classList.add('shrink');
        } else {
            header.style.height = 'auto'; // Tilbakestill til opprinnelig høyde
            header.classList.remove('shrink');
        }
    });
});
