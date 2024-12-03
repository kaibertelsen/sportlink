
function endplayConverter(data){
// Parse hoved-array
const parsedData = data.map(item => {
    const parsedItem = JSON.parse(item);

    // Parse "endplay" hvis det er en gyldig JSON-streng
    if (parsedItem.endplay) {
        try {
            parsedItem.endplay = JSON.parse(parsedItem.endplay);
        } catch (error) {
            console.warn("Feil ved parsing av endplay:", error);
        }
    }

    return parsedItem;
});
return parsedData;
}







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