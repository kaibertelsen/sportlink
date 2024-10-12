function loadTourment(data){
    //for å gå videre i tab systemet
    document.getElementById('tabtoturnering').click();

    loadTourmentHeader(data);
    listDivision(data);
    getMatch(data);
    console.log(data);
}

function loadTourmentHeader(data){

    const headerholder = document.getElementById("tourmentheader");
    
    const icon = headerholder.querySelector(".tourmenticon");
    icon.removeAttribute('srcset');
    icon.src = data.icon;

    const name = headerholder.querySelector(".tourmentlable");
    name.textContent = data.name;
    
    const date = headerholder.querySelector(".datename");
    date.textContent = formatDate(data.startdate);
    
}

function listDivision(tournament){
    const list = document.getElementById("divisionholder");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    const nodeelement = elementlibrary.querySelector('.divisionbutton');
 
    let divisionArray = makeDivisionArray(tournament);
    
    for (let item of divisionArray) {
        // Lag en kopi av elementet
        const rowelement = nodeelement.cloneNode(true);
        rowelement.id = "di"+item.airtable;

        rowelement.onclick = function() {
            //filterSporttype(item);
        }
        rowelement.textContent = item.name;
        
        if (item === divisionArray[0]) {
            rowelement.style.backgroundColor = "#192219";
            rowelement.style.borderColor = "#61de6e";
        }
        list.appendChild(rowelement);
    }
}


function makeDivisionArray(tournament){
    let divisionArray = [];
    if(tournament?.division){
        //har division
        for(var i = 0;i<tournament.division.length;i++){
            divisionArray.push({name:tournament.divisionname[i],airtable:tournament.division[i]});
        }
        divisionArray = sortArrayABC(divisionArray,"name");
        divisionArray.unshift({
            name: "Alle",
            airtable: ""
        });
    }
  
    return divisionArray;
}

function getMatch(data){
    var body = airtablebodylistAND({tournamentid:data.airtable,archived:0});
    Getlistairtable(baseId,"tblrHBFa60aIdqkUu",body,"getMatchresponse");
}




function getMatchresponse(data,id){
    match = rawdatacleaner(data);

    console.log(data);

}