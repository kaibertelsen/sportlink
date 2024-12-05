function ruteresponse(data,id){
    if(id == "getTournamentresponse"){
        getTournamentresponse(data);
    }else if(id == "getMatchresponse"){
        getMatchresponse(data,id);
    }else if(id == "getTeamresponse"){
        getTeamresponse(data);
    }else if(id == "responseOrganizerlist"){
        responseOrganizerlist(data);
    }else if(id == "responseSportlist"){
        responseSportlist(data);
    }else if(id == "responseCreateTournament"){
        responseCreateTournament(data);
    }
}