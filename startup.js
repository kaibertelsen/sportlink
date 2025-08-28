
MemberStack.onReady.then(function(member) {
    if (member.loggedIn){
    //hente alle turneringer fra server
    clientID = member.klient;
    

    document.getElementById("turnamenttabbutton").click();
    document.getElementById("taballturnering").click();

    }else{
    //document.getElementById("logginbutton").click();
    }
}
);

function startFirstFunctions() {
    // Sjekk om lokal nøkkel UserContry er satt
    if (!localStorage.getItem("UserCountry")) {
        // Sjekk verdi
        let UserCountry = localStorage.getItem("UserCountry");

        
        let standardCountry = "NO"; // Sett standard til Norge
        let klientid = "recCdECitGpKE2O1F" // Sett standard klientid hvis nødvendig

        //Hvis den er EU
        if (UserCountry === "EU") {
            standardCountry = "EU";
            klientid = "recCdECitGpKE2O1F"; // Sett klientid for EU
        }

       // getTournament(klientid);
       console.log("Har skal den gå videre", standardCountry);

    }else{
        //starte med å hente lokal pososjon
        checkLocation();





    }
    
}


function checkUserCountry(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Bruk en geokodingstjeneste for å få land basert på koordinatene
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                .then(response => response.json())
                .then(data => {
                    const countryCode = data.countryCode; // F.eks. "NO" for Norge
                    userCountry = countryCode;
                    console.log("Brukerens land:", userCountry);
                })
                .catch(error => {
                    console.error('Feil ved henting av land:', error);
                });
        }
        , (error) => {
            console.error('Feil ved henting av posisjon:', error);
            userCountry = "NO"; // Sett en standardverdi hvis posisjon ikke kan hentes
        });
    }else{
        userCountry = "NO"; // Sett en standardverdi hvis geolokasjon ikke støttes
    }
}

async function checkLocation() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
  
      const countryCode = data.country; // f.eks. "NO"
      const euMember = data.in_eu;      // true/false
  
      if (countryCode === "NO") {
        console.log("Brukeren er i Norge");
        localStorage.setItem("UserCountry", "NO");
      } else if (euMember) {
        console.log("Brukeren er i EU (men ikke Norge)");
        localStorage.setItem("UserCountry", "EU");
      } else {
        console.log("Brukeren er utenfor EU og Norge");
        localStorage.setItem("UserCountry", "OTHER");
      }

      startFirstFunctions();
        
  
    } catch (error) {
      console.error("Kunne ikke hente lokasjon:", error);
        localStorage.setItem("UserCountry", "OTHER");
        startFirstFunctions();
    }
  }