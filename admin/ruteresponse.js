function ruteresponse(data,id){
    if(id == "responseOrganizerlist"){
        responseOrganizerlist(data);
    }else if(id == "responseSportlist"){
        responseSportlist(data);
    }else if(id == "responseClublist"){
        responseClublist(data);
    }else if(id == "responseCreatTurnament"){
        responseCreatTurnament(data);
    }else if(id == "responsCreatDivisions"){
        responsCreatDivisions(data);
    }else if(id == "responsCreatGroups"){
        responsCreatGroups(data);
    }else if(id == "responseSaveTeams"){
        responseSaveTeams(data);
    }else if(id == "responseSaveMatches"){
        responseSaveMatches(data);
    }

}