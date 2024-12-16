
MemberStack.onReady.then(function(member) {
    if (member.loggedIn){
    //hente alle turneringer fra server
    clientID = member.klient;
    

    document.getElementById("turnamenttabbutton").click();
    document.getElementById("taballturnering").click();

    }else{
    //document.getElementById("logginbutton").click();
    }
}
);

