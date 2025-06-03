


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
    "https://kaibertelsen.github.io/sportlink/endplay.js",
    "https://kaibertelsen.github.io/sportlink/tourmentpage.js",
    "https://kaibertelsen.github.io/sportlink/ruteresponse.js",
    "https://kaibertelsen.github.io/sportlink/datekonverters.js",
    "https://kaibertelsen.github.io/sportlink/listteams.js",
    "https://kaibertelsen.github.io/sportlink/buttontriggers.js",
    "https://kaibertelsen.github.io/sportlink/pointsystemgenerator.js",
    "https://kaibertelsen.github.io/sportlink/startup.js",
    "https://kaibertelsen.github.io/sportlink/create/create.js",
    "https://kaibertelsen.github.io/sportlink/svipefunction.js",
    "https://kaibertelsen.github.io/sportlink/admin/loggviewer.js"
    
];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
    getTournament("recCdECitGpKE2O1F");
    initDayFilterToggle();
    initMatchlistFilter()

    initStatisticsFilter();

}).catch(error => {
    console.error(error);
});



