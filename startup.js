document.addEventListener("DOMContentLoaded", function() {

    MemberStack.onReady.then(function(member) {
        if (member.loggedIn){
        //hente alle turneringer fra server
        console.log(member);
        //getTournament(klientid);
        }
    }
    );

});

function getTournament(klientid) {
    var body = airtablebodylistAND({klient:klientid});
    Getlistairtable(baseId,"tbloP9XOP0eWMT9XH",body,"getTournamentresponse");
}

function getTournamentresponse(data){
const tournament = rawdatacleaner(data);
console.log(tournament);
}

