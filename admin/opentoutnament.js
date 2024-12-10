function openTournament(Tournamentid){
    console.logh(Tournamentid);
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");
}

function responsGetTournament(data){
console.log(data.fields);
}