function ruteresponse(data,id){
    if(id == "getTournamentresponse"){
        getTournamentresponse(data);
    }else if(id == "getMatchresponse"){
        getMatchresponse(data,id);
    }else if(id == "getTeamresponse"){
        getTeamresponse(data);
    }
    
}