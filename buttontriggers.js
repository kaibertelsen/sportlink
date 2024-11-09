
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


   

