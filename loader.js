


function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(`Failed to load script: ${url}`);
        document.head.appendChild(script);
    });
}

// Liste over CDN-URL-er som skal lastes inn
const cdnScripts = [
    "https://kaibertelsen.github.io/sportlink/globalvariabler.js",
    "https://kaibertelsen.github.io/sportlink/apicom.js",
    "https://kaibertelsen.github.io/sportlink/listgenerator.js",
    "https://kaibertelsen.github.io/sportlink/globalfunctions.js",
    "https://kaibertelsen.github.io/sportlink/listmatch.js",
    "https://kaibertelsen.github.io/sportlink/tourmentpage.js",
    "https://kaibertelsen.github.io/sportlink/ruteresponse.js",
    "https://kaibertelsen.github.io/sportlink/datekonverters.js",
    "https://kaibertelsen.github.io/sportlink/listteams.js",
    "https://kaibertelsen.github.io/sportlink/buttontriggers.js",
    "https://kaibertelsen.github.io/sportlink/pointsystemgenerator.js",
    "https://kaibertelsen.github.io/sportlink/startup.js"
    
];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
}).catch(error => {
    console.error(error);
});


const header = document.getElementById("headerwrapper");
// Hent opprinnelig høyde av headeren
const originalHeight = header.offsetHeight;
document.addEventListener("scroll", function() {
    const scrollPosition = window.scrollY;

    // Krymp headeren når brukeren scroller mer enn 50px ned
    if (scrollPosition > 50) {
        header.style.height = `${originalHeight / 2}px`; // Sett høyden til 50% av opprinnelig
        header.classList.add('shrink');
    } else {
        header.style.height = 'auto'; // Tilbakestill til opprinnelig høyde
        header.classList.remove('shrink');
    }
});

