


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
    "https://kaibertelsen.github.io/sportlink/admin/adminstartup.js",
    "https://kaibertelsen.github.io/sportlink/admin/importmodul.js",
    "https://kaibertelsen.github.io/sportlink/admin/opentoutnament.js",
    "https://kaibertelsen.github.io/sportlink/apicom.js",
    "https://kaibertelsen.github.io/sportlink/admin/ruteresponse.js",
    "https://kaibertelsen.github.io/sportlink/admin/convertdata.js",
    "https://kaibertelsen.github.io/sportlink/admin/editListFunction.js",
    "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.2.0/exceljs.min.js" 
];

// Laste inn alle skriptene sekvensielt
cdnScripts.reduce((promise, script) => {
    return promise.then(() => loadScript(script));
}, Promise.resolve()).then(() => {
    console.log("All scripts loaded");
    startUpAdmin();
}).catch(error => {
    console.error(error);
});

