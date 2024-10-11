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
    tournament = rawdatacleaner(data);
    //sorter på dato
    listTournament(sortDateArray(tournament,"startdate"));
}

function listTournament(tournament){
    const list = document.getElementById("maintournamentlist");
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.turneringholder');

    for (let item of tournament) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        
        const nameelement = rowelement.querySelector(".turnname");
        nameelement.textContent = item.name;

        const dateelement = rowelement.querySelector(".datename");
        dateelement.textContent = formatDate(item.startdate);

        const iconelement = rowelement.querySelector(".turnicon");
        iconelement.removeAttribute('srcset');
        iconelement.src = item.icon;

        const iconsportelement = rowelement.querySelector(".sporticon");
        iconsportelement.removeAttribute('srcset');
        iconsportelement.src = item.sporticon[0];
        
        const statuslableelement = rowelement.querySelector(".sattuslable");
        if(isDatePassed(item.startdate)){
        statuslableelement.textContent = "Spilles nå!";
        statuslableelement.style.color = "#60df6e";
        }else{
        statuslableelement.textContent = statusDatetoplay(item.startdate);
        }
        
        list.appendChild(rowelement);
      }

}