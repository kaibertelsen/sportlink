// Debug overlay - diskret "i" knapp nede til høyre
// Lagrer logg til localStorage slik at den overlever reload/krasj
(function () {
    var STORAGE_KEY = "debugoverlay_logs";
    var maxLogs = 200;
    var logs = [];
    var panel, content;

    try { logs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { logs = []; }

    function saveLogs() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); }
        catch (e) { /* full */ }
    }

    function addLog(msg) {
        var now = new Date();
        var ts = now.toLocaleTimeString("nb-NO") + "." + String(now.getMilliseconds()).padStart(3, "0");
        logs.push("[" + ts + "] " + msg);
        while (logs.length > maxLogs) logs.shift();
        saveLogs();
        if (panel && panel.style.display !== "none") {
            content.textContent = logs.join("\n");
            panel.scrollTop = panel.scrollHeight;
        }
    }

    // --- Lag UI ---
    var btn = document.createElement("div");
    btn.textContent = "i";
    btn.setAttribute("style",
        "position:fixed;bottom:12px;right:12px;z-index:99999;" +
        "width:32px;height:32px;border-radius:50%;" +
        "background:rgba(255,255,255,0.15);color:#aaa;" +
        "display:flex;align-items:center;justify-content:center;" +
        "font-size:16px;font-family:serif;font-style:italic;" +
        "cursor:pointer;border:1px solid rgba(255,255,255,0.2);" +
        "-webkit-tap-highlight-color:transparent;user-select:none;"
    );

    panel = document.createElement("div");
    panel.setAttribute("style",
        "position:fixed;bottom:52px;right:12px;z-index:99998;" +
        "width:90vw;max-width:360px;max-height:50vh;overflow-y:auto;" +
        "background:rgba(0,0,0,0.95);color:#0f0;" +
        "font-size:11px;font-family:monospace;line-height:1.5;" +
        "padding:10px;border-radius:8px;" +
        "border:1px solid rgba(255,255,255,0.15);" +
        "display:none;white-space:pre-wrap;word-break:break-word;" +
        "-webkit-overflow-scrolling:touch;"
    );

    var clearBtn = document.createElement("div");
    clearBtn.textContent = "Tøm logg";
    clearBtn.setAttribute("style",
        "position:sticky;top:0;text-align:right;color:#f88;" +
        "cursor:pointer;font-size:11px;padding-bottom:6px;" +
        "background:rgba(0,0,0,0.95);"
    );
    clearBtn.onclick = function (e) {
        e.stopPropagation();
        logs.length = 0;
        saveLogs();
        content.textContent = "(ingen logg ennå)";
    };

    content = document.createElement("div");
    panel.appendChild(clearBtn);
    panel.appendChild(content);

    btn.onclick = function (e) {
        e.stopPropagation();
        if (panel.style.display !== "none") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
            content.textContent = logs.length ? logs.join("\n") : "(ingen logg ennå)";
            panel.scrollTop = panel.scrollHeight;
        }
    };

    document.body.appendChild(panel);
    document.body.appendChild(btn);

    // --- Overstyr console for å fange timings og feil ---
    var timers = {};
    var origTime = console.time.bind(console);
    var origTimeEnd = console.timeEnd.bind(console);
    var origLog = console.log.bind(console);
    var origError = console.error.bind(console);

    console.time = function (label) {
        timers[label] = performance.now();
        origTime(label);
    };

    console.timeEnd = function (label) {
        origTimeEnd(label);
        if (timers[label] !== undefined) {
            var ms = (performance.now() - timers[label]).toFixed(1);
            addLog(">> " + label + ": " + ms + "ms");
            delete timers[label];
        }
    };

    console.log = function () {
        origLog.apply(console, arguments);
        // Sjekk raskt om første argument er relevant før vi prosesserer
        var first = arguments[0];
        if (typeof first === "string" && first.indexOf("viewteam") === 0) {
            var msg = Array.prototype.slice.call(arguments).map(function (a) {
                return typeof a === "object" ? JSON.stringify(a) : String(a);
            }).join(" ");
            addLog(msg);
        }
    };

    console.error = function () {
        origError.apply(console, arguments);
        var first = arguments[0];
        var msg = typeof first === "string" ? first : String(first);
        addLog("ERROR: " + msg.substring(0, 200));
    };

    window.addEventListener("error", function (e) {
        var file = (e.filename || "").split("/").pop();
        addLog("UNCAUGHT: " + e.message + " @ " + file + ":" + e.lineno);
    });

    window.addEventListener("unhandledrejection", function (e) {
        var reason = e.reason ? (e.reason.message || String(e.reason)) : "unknown";
        addLog("PROMISE: " + reason);
    });

    addLog("--- Side lastet ---");
})();
