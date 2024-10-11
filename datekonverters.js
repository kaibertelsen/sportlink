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
    return eventsArray
    }