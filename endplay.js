function listendplay(data,endplay) {

    const activeDivision = getActiveDivisionFilter();
    let filteredMatches = activeDivision === "" ? data : data.filter(match => match.division === activeDivision);
    

    const list = document.getElementById("endplaylist");
    list.replaceChildren();
    const elementlibrary = document.getElementById("elementlibrary");
    //const nodeelement = elementlibrary.querySelector('.groupholder');

    for (let item of grouparray) {
        //const rowelement = nodeelement.cloneNode(true);
        //list.appendChild(rowelement);
    }
    
}