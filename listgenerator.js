function listTournament(tournament){
    const list = document.getElementById("maintournamentlist");
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.turneringholder');

    for (let item of tournament) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.dataset.sport = item.sport[0];
        rowelement.onclick = function() {
            loadTourment(item);
        }

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
        rowelement.id = "fi"+item.sport[0];

        rowelement.onclick = function() {
            filterSporttype(item);
        }

        const nameelement = rowelement.querySelector(".sportlable");
        nameelement.textContent = item.sportname;
        
        const iconsportelement = rowelement.querySelector(".sporticon");
        iconsportelement.removeAttribute('srcset');
        if(item.sporticon != ""){
        iconsportelement.src = item.sporticon;
        }else{
            iconsportelement.remove(); 
        }
        

        list.appendChild(rowelement);
    }



}


function filterSporttype(item){

     const buttonlist = document.getElementById("sportlist");
     let allButtons =  buttonlist.children;
     
     allButtons.forEach(element => {
        //sett standard verdien
        element.style.backgroundColor = "#1d1d1d";
        element.style.borderColor = "transparent";
     });
     
     let buttonid = "fi"+item.sport[0];
     const thisfilterbutton = document.getElementById(buttonid);

     if(thisfilterbutton){
      thisfilterbutton.style.backgroundColor = "#192219";
       thisfilterbutton.style.borderColor = "#61de6e";
     }

    const list = document.getElementById("maintournamentlist");
    let typesport = item.sport[0];
    let allElements =  list.children;
    // Gå gjennom alle elementene og logg dem til konsollen
    allElements.forEach(element => {
       if(element.dataset?.sport && element.dataset.sport == typesport){
        element.style.display = "grid";
       }else if(typesport == ""){
       element.style.display = "grid";
       }else{
        element.style.display = "none";
       }
  });
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
        sport: event.sport[0],
        sportname: event.sportname[0],
        sporticon: event.sporticon[0]
        });
    }
    });

    uniqueSportsArray = sortArrayABC(uniqueSportsArray,"sportname")
        uniqueSportsArray.unshift({
            sport: [""],
            sportname: ["Alle"],
            sporticon: [""]});

    return uniqueSportsArray;
}