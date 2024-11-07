function sortArrayABC(Array,key) {
    return Array.sort((a, b) => {
      const nameA = a[key].toLowerCase();
      const nameB = b[key].toLowerCase();
  
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }


  function makeObjectFromAirtableJSON(data, key) {
    // Sjekker om dataene i nøkkelen eksisterer
    if (data[key]) {
        let jsonArray = data[key];
        console.log(jsonArray);
        try {
            // Konverterer hver streng i arrayen til et objekt
            let parsedObjects = jsonArray.map(item => {
                let obj = JSON.parse(item);

                // Sjekk om `goalsett` finnes og er en streng
                if (obj.goalsett && typeof obj.goalsett === "string" && obj.goalsett.trim() !== "") {
                    try {
                        // Parse `goalsett` som JSON hvis det er en streng
                        obj.goalsett = JSON.parse(obj.goalsett);
                    } catch (error) {
                        console.warn("Feil ved parsing av goalsett:", error);
                    }
                }
                return obj;
            });

            // Sjekker resultatet i konsollen
            console.log(parsedObjects);
            return parsedObjects;
        } catch (error) {
            console.error("Feil ved parsing av JSON-strenger:", error);
            return false;
        }
    }
    return false;
}
