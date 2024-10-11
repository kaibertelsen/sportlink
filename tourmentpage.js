function loadTourment(data){
    //for å gå videre i tab systemet
    document.getElementById('tabtoturnering').click();

    loadTourmentHeader(data);




    console.log(data);
}

function loadTourmentHeader(data){

    const headerholder = document.getElementById("tourmentheader");
    
    const icon = headerholder.querySelector(".tourmenticon");
    icon.removeAttribute('srcset');
    icon.src = data.icon;

    const name = rowelement.querySelector(".tourmentlable");
    name.textContent = data.name;
    
    const date = rowelement.querySelector(".datename");
    date.textContent = formatDate(data.startdate);
    
}