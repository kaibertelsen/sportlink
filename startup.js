document.addEventListener("DOMContentLoaded", function() {

    MemberStack.onReady.then(function(member) {
        if (member.loggedIn){
        //hente alle turneringer fra server
        getTournament(member.klient);
        }
    }
    );

});

function getTournament(klientid) {
    var body = airtablebodylistAND({klientid:klientid});
    Getlistairtable(baseId,"tblGhVlhWETNvhrWN",body,"getTournamentresponse");
}

function getTournamentresponse(data){
const tournament = rawdatacleaner(data);
console.log(tournament);
}

