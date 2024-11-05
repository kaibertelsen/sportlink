function generatePointToTeams(data){
    if(activetournament.sport[0] == "recAEU6UjebhKfFBy"){
    //fotball
    console.log("Dette er fotballoppsett")
    return generateFotballPointToTeams(data);
    }else{
        console.log("Dette er et oppsett som ikke er difinert enda")
    }
}


function generateFotballPointToTeams(data){
    for (let team of data){
    //finne kamper dette laget er en del av
    getpointForThisTeam(team,match);
    }
return data;
}

function getpointForThisTeam(team,matchs){

console.log(team)
console.log(matchs);

}