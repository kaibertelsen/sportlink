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
                if(item?.enddate && isDatePassed(item.enddate)){
                    statuslableelement.textContent = "Er avsluttet!";
                    statuslableelement.style.color = "#818181";
                }else{
                    statuslableelement.textContent = "Spilles nå!";
                    statuslableelement.style.color = "#60df6e";
                }
        }else{
        statuslableelement.textContent = statusDatetoplay(item.startdate);
        }
        
        list.appendChild(rowelement);
      }

}


function listSports(tournament){
    const list = document.getElementById("sportlist");
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.turnfilterbutton');
    let sports = findeunicSport(tournament);

    for (let item of sports) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.dataset.id = item.sport;
        
        const nameelement = rowelement.querySelector(".sportlable");
        nameelement.textContent = item.sportname;
        
        const iconsportelement = rowelement.querySelector(".sporticon");
        iconsportelement.removeAttribute('srcset');
        iconsportelement.src = item.sporticon;

        list.appendChild(rowelement);
    }



}


function findeunicSport(Array){
    // Ny array for unike sportsverdier
    let uniqueSportsArray = [];

    // Funksjon for å finne unike sport, sportname og sporticon
    Array.forEach(event => {
    // Sjekk om sport allerede finnes i den nye arrayen
    let exists = uniqueSportsArray.some(sportObj => sportObj.sport[0] === event.sport[0]);

    // Hvis det ikke finnes, legg det til
    if (!exists) {
        uniqueSportsArray.push({
        sport: event.sport,
        sportname: event.sportname,
        sporticon: event.sporticon
        });
    }
    });
    return Array;
}