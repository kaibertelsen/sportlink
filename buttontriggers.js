
document.getElementById('buttontoallturnering').onclick = function() {
    document.getElementById('taballturnering').click();
    //tøm listene i konkuransen
    emtyTurnamentLists();
}
         
document.getElementById('headermaillogo').onclick = function() {
    location.reload();
}



// on turneringspage
document.getElementById('tabeltabbutton').onclick = function() {
    markActiveButton(document.getElementById('tabeltabbutton'));
    goToSlide(0);
    
}

document.getElementById('matchtabbutton').onclick = function() {
    markActiveButton(document.getElementById('matchtabbutton'));
    goToSlide(1)
}

document.getElementById('endplaytabbutton').onclick = function() {
    markActiveButton(document.getElementById('endplaytabbutton'));
    goToSlide(2);
   // document.getElementById('loadendplaybutton').click();
}

document.getElementById('buttontoturnament').onclick = function() {
    document.getElementById('tabtoturnering').click();
}
   

document.getElementById('admincreateturnamentbutton').onclick = function() {
    // Finn elementet som skal kopieres
    const createTurnamentHolder = document.getElementById('creatturnamentholder');
    
    if (!createTurnamentHolder) {
        console.warn('Element med id "creatturnamentholder" finnes ikke.');
        return;
    }

    // Finn containeren der elementet skal legges til
    const containerTurnament = document.getElementById('containerturnament');
    
    if (!containerTurnament) {
        console.warn('Element med id "containerturnament" finnes ikke.');
        return;
    }

    // Sjekk om elementet allerede er lagt til
    const existingElement = containerTurnament.querySelector('.cloned-turnament-holder');

    if (existingElement) {
        // Fjern det eksisterende elementet
        containerTurnament.removeChild(existingElement);
    } else {
        // Klon elementet
        const clonedElement = createTurnamentHolder.cloneNode(true);

        // Legg til en unik klasse for enklere identifikasjon
        clonedElement.classList.add('cloned-turnament-holder');

        // Legg det klonede elementet øverst i containeren
        containerTurnament.insertBefore(clonedElement, containerTurnament.firstChild);
    }
};






