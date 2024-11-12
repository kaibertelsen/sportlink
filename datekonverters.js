function formatDate(dateString) {
    // Lag et nytt Date-objekt basert på ISO-datoen
    let date = new Date(dateString);
  
    // Hent dag og klokkeslett
    let day = date.getDate();
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
  
    // Liste over månedsnavn
    let months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    let monthName = months[date.getMonth()];
  
    // Formatert dato i ønsket format "6. okt kl. 10:39"
    return `${day}. ${monthName} kl. ${hours}:${minutes}`;
  }


  function isDatePassed(dateString) {
    // Lag et nytt Date-objekt basert på dato-strengen
    let givenDate = new Date(dateString);
  
    // Hent den nåværende datoen og tiden
    let now = new Date();
  
    // Sjekk om den gitte datoen er tidligere enn nå
    return givenDate < now;
  }

  function statusDatetoplay(dateString) {
    // Lag et nytt Date-objekt basert på dato-strengen
    let givenDate = new Date(dateString);
  
    // Hent den nåværende datoen og tiden
    let now = new Date();
  
    // Sjekk om datoen har passert
    if (givenDate < now) {
      return "Spilles nå"; // Datoen har passert
    } else {
      // Beregn tiden som gjenstår
      let timeDifference = givenDate - now;
  
      // Konverter til dager og timer
      let daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Antall hele dager
      let hoursRemaining = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // Timer etter de hele dagene
  
      return `${daysRemaining} d ${hoursRemaining} t igjen`;
    }
  }
  
  function sortDateArray(Array,key){
        Array.sort((a, b) => {
        let dateA = new Date(a[key]);
        let dateB = new Date(b[key]);
        return dateA - dateB; // Sorterer i stigende rekkefølge
        });
    return Array
    }

    function formatDateToNorwegian(dateString) {
        const date = new Date(dateString);
    
        // Mapping av ukedager og måneder på norsk
        const weekdays = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
        const months = ["jan", "feb", "mars", "apr", "mai", "juni", "juli", "aug", "sep", "okt", "nov", "des"];
    
        // Hent ukedag, dag, måned og år
        const dayOfWeek = weekdays[date.getDay()]; // F.eks. "Mandag"
        const day = date.getDate(); // F.eks. 14
        const month = months[date.getMonth()]; // F.eks. "okt"
        const year = date.getFullYear(); // F.eks. 2024
    
        // Returner i ønsket format
        return `${dayOfWeek} ${day}.${month}. ${year}`;
    }


    function formatdatetoTime(dateString) {
        const date = new Date(dateString);
    
        // Hent timen og minuttene fra datoen
        let hours = date.getUTCHours();  // Bruk UTC-tid
        let minutes = date.getUTCMinutes();
    
        // Legg til en ledende null hvis timer eller minutter er ensifrede
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
    
        // Returner formatert tid
        return `${hours}:${minutes}`;
    }
    

    function formatdatetoDateAndTime(dateString) {
      const date = new Date(dateString);
  
      // Hent ukedag og måned navn
      const days = [
          "Søndag", "Mandag", "Tirsdag", "Onsdag",
          "Torsdag", "Fredag", "Lørdag"
      ];
      const months = [
          "januar", "februar", "mars", "april",
          "mai", "juni", "juli", "august",
          "september", "oktober", "november", "desember"
      ];
  
      const dayName = days[date.getDay()]; // Henter navnet på ukedagen
      const day = date.getDate(); // Henter datoen
      const monthName = months[date.getMonth()]; // Henter navnet på måneden
      const hours = String(date.getHours()).padStart(2, '0'); // Henter timen (2-sifret)
      const minutes = String(date.getMinutes()).padStart(2, '0'); // Henter minuttene (2-sifret)
  
      // Returner formatert dato og tid
      return `${dayName} ${day}. ${monthName} kl. ${hours}:${minutes}`;
  }
  