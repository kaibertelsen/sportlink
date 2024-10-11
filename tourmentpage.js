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

    const name = headerholder.querySelector(".tourmentlable");
    name.textContent = data.name;
    
    const date = headerholder.querySelector(".datename");
    date.textContent = formatDate(data.startdate);
    
}