function openTournament(Tournamentid){
    GETairtable(baseId,"tblGhVlhWETNvhrWN",Tournamentid,"responsGetTournament");
}

function responsGetTournament(data){
console.log(data.fields);

document.getElementById("tournamenttabbutton").click();
//lage lister av disse
divisjonjson
teamjson
matchjson

//Informasjn om Tournament
//Navn
//Icon
//Event
//Startdato
//Sluttdato
//Type sport

}


function listDivision(divisions){

    const list = document.getElementById("divisionlistholder");
    list.replaceChildren(); // Fjern tidligere innhold

    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector(".divisionrow");

    for (let division of divisions){
        // Fyll ut data i radens felter
        const rowelement = nodeelement.cloneNode(true);
        rowelement.querySelector(".name").textContent = division.name || "Ukjent navn";

            const groupNode = rowelement.querySelector(".group");
            for (var i = 0;i<division.group.length;i++) {
            const groupElement = groupNode.cloneNode(true);
            groupElement.querySelector(".groupname").textContent = division.group[i].name;
            groupNode.parentElement.appendChild(groupElement);
            }       
            groupNode.style.display = "none";

            const endNode = rowelement.querySelector(".endplaydiv");
            for (var i = 0;i<division.endplay.length;i++) {
             const endElement = endNode.cloneNode(true);
             endElement.querySelector(".endname").textContent = division.endplay[i].endplayname;
             endElement.querySelector(".endcount").textContent = division.endplay[i].finalecount;
             endNode.parentElement.appendChild(endElement);
            }       
            endNode.style.display = "none";

        list.appendChild(rowelement);
    }

}