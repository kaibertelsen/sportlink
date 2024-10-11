document.addEventListener("DOMContentLoaded", function() {
    //hente alle turneringer fra server
    getTournament(klientid);
});

function getTournament(klientid) {
    var body = airtablebodylistAND({klient:klientid});
    Getlistairtable(baseId,"tbloP9XOP0eWMT9XH",body,"getTournamentresponse");
}

function getTournamentresponse(data){
const tournament = rawdatacleaner(data);
console.log(tournament);
}

