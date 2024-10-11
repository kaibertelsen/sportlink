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
    var id = "["+klientid+"]";
    var body = airtablebodylistAND({klient:id});
    Getlistairtable(baseId,"tbloP9XOP0eWMT9XH",body,"getTournamentresponse");
}

function getTournamentresponse(data){
const tournament = rawdatacleaner(data);
console.log(tournament);
}

