
document.getElementById('buttontoallturnering').onclick = function() {
    document.getElementById('taballturnering').click();
    //tøm listene i konkuransen
    emtyTurnamentLists();
    isInTurnament = false;
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
    //matchsiden
    if(previouspage == "team"){
    document.getElementById("thisteamtabbutton").click();
    }else{
    document.getElementById('tabtoturnering').click();
    }
}

document.getElementById('updatetournamentlogobutton').onclick = function() {
    //update this tournament
updateThisTournament();
};


document.getElementById('buttonthisteam').onclick = function() {
    if(previouspage == "match"){
    document.getElementById("thismatchtabbutton").click();
    }else{
    document.getElementById('tabtoturnering').click();
    }
}

