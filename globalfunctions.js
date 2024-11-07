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
    if (data[key]) {
        let jsonArray = data[key];
        console.log(jsonArray);

        try {
            let parsedObjects = jsonArray.map(item => {
                let obj = JSON.parse(item);

                // Sjekk om `goalsett` finnes og er en streng
                if (obj.goalsett && typeof obj.goalsett === "string" && obj.goalsett.trim() !== "") {
                    console.log("Original goalsett:", obj.goalsett);

                    try {
                        // Fjern eventuelle omsluttende sitater rundt `goalsett`-strengen
                        if (obj.goalsett.startsWith('"') && obj.goalsett.endsWith('"')) {
                            obj.goalsett = obj.goalsett.slice(1, -1);
                        }

                        // Bytt ut escaped anførselstegn i `goalsett` med faktiske anførselstegn
                        obj.goalsett = obj.goalsett.replace(/\\"/g, '"');

                        // Parse `goalsett` som JSON etter at escape-tegn er fjernet
                        obj.goalsett = JSON.parse(obj.goalsett);

                        // Hvis `goalsett` inneholder nestede objekter som strenger, parse dem også
                        for (let sett in obj.goalsett) {
                            if (typeof obj.goalsett[sett] === "string") {
                                obj.goalsett[sett] = JSON.parse(obj.goalsett[sett]);
                            }
                        }

                        console.log("Parsed goalsett:", obj.goalsett);
                    } catch (error) {
                        console.warn("Feil ved parsing av goalsett etter rydding:", error);
                    }
                }
                return obj;
            });

            console.log(parsedObjects);
            return parsedObjects;
        } catch (error) {
            console.error("Feil ved parsing av JSON-strenger:", error);
            return false;
        }
    }
    return false;
}
