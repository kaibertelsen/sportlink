
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
    startCreateTurnament();
};

document.getElementById('buttonthisteam').onclick = function() {
    document.getElementById('tabtoturnering').click();
}

