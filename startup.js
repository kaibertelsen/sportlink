
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
    if (localStorage.getItem("UserCountry")) {
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
        changeFlagg(standardCountry);
        console.log("Har skal den gå videre", standardCountry);


    }else{
        //starte med å hente lokal pososjon
       checkLocation();

       //USA
        //checkLocation("8.8.8.8")

        //EU
        //checkLocation("91.198.174.192")



    }
    
}

function changeFlagg(countryCode){
    const flagElement = document.getElementById("flagcountryicon");
    if(flagElement){

        let urlFlag = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b03d127a60db315ee22298_round-flag-norway-.png";
        //Norsk flagg url
        if(countryCode === "NO"){
            urlFlag = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b03d127a60db315ee22298_round-flag-norway-.png";
        }else if(countryCode === "EU"){
            urlFlag = "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b19604a36f1122cb814a54_round-flag-eu-.png";
        }

        flagElement.src = urlFlag;
        flagElement.alt = countryCode + " flag";

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

async function checkLocation(ipOverride) {
    const url = ipOverride
      ? `https://ipapi.co/${ipOverride}/json/`
      : `https://ipapi.co/json/`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      const countryCode = data.country; // f.eks. "NO"
      const euMember   = data.in_eu;    // true/false
  
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