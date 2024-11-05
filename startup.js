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



function getTournament(klientid) {
    var body = airtablebodylistAND({klientid:klientid,archived:0});
    Getlistairtable(baseId,"tblGhVlhWETNvhrWN",body,"getTournamentresponse");
}

function getTournamentresponse(data){
    tournament = rawdatacleaner(data);
    //lag filter
    listSports(tournament);
    //sorter på dato
    listTournament(sortDateArray(tournament,"startdate"));
}
