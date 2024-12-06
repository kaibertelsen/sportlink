
//uploader
const ctx = document.querySelector('uc-upload-ctx-provider')
    ctx.addEventListener('file-url-changed', e => {
    const uploadedFileInfo = e.detail; // Detaljer om den opplastede filen
    const urlToXlsFile = uploadedFileInfo.cdnUrl; // Hent URL til bildet fra `cdnUrl`
    importXlsFile(urlToXlsFile);
});

function importXlsFile(urlToXlsFile){
console.log(urlToXlsFile)

}