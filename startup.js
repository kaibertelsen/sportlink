document.addEventListener("DOMContentLoaded", function() {
   
});

MemberStack.onReady.then(function(member) {
    if (member.loggedIn){
    //hente alle turneringer fra server
    getTournament(member.klient);
    }else{
    document.getElementById("logginbutton").click();
    }
}
);



