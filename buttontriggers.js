
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

document.getElementById('loadtablebutton').onclick = function() {
   // getTeams();
   listteams(teams);
}





