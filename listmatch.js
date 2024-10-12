function listmatch(data,grouptype){

//sorter på time feltet
let matchs = sortDateArray(data,"time");

let grouparray = [];
    if(grouptype == "dato"){
        grouparray = groupArraybyDate(matchs)
    }

    const list = document.getElementById("matchlistholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.groupholder');

    for (let item of grouparray) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.onclick = function() {
            //loadTourment(item);
        }
     
        const nameelement = rowelement.querySelector(".groupheadername");
        nameelement.textContent = formatDateToNorwegian(item.date);

        const contentholder = rowelement.querySelector(".contentholder");
        contentholder.replaceChildren();
        const nodematchholder = elementlibrary.querySelector('.matchholder');

        for (let match of item.matches){
            const matchelement = nodematchholder.cloneNode(true);

            const team1name = matchelement.querySelector(".team1");
            team1name.textContent = match.team1name;

            const team2name = matchelement.querySelector(".team2");
            team1name.textContent = match.team2name;
            contentholder.appendChild(matchelement);
        }

        list.appendChild(rowelement);
    }
}






function groupArraybyDate(matchs){

        // Initialiser en ny array for grupperte kamper
        let grouparray = [];
        // Bruk reduce for å gruppere kampene etter dato
        let groupedByDate = matchs.reduce((groups, match) => {
            // Hent kun datoen fra 'time'-feltet (uten klokkeslett)
            let matchDate = new Date(match.time).toISOString().split('T')[0];

            // Hvis datoen ikke finnes i grupperingsobjektet, opprett en ny array for den datoen
            if (!groups[matchDate]) {
                groups[matchDate] = [];
            }

            // Legg til kampen i arrayen for den aktuelle datoen
            groups[matchDate].push(match);

            return groups;
        }, {});

        // Konverter objektet til en array med dato som nøkkel
        grouparray = Object.keys(groupedByDate).map(date => {
            return {
                date: date,
                matches: groupedByDate[date]
            };
        });
    

    return grouparray;
}

