// Debug overlay - diskret "i" knapp nede til høyre
// Lagrer logg til localStorage slik at den overlever reload/krasj
(function () {
    const STORAGE_KEY = "debugoverlay_logs";
    const maxLogs = 200;

    function loadLogs() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }
    function saveLogs(logs) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(logs)); }
        catch { /* full storage */ }
    }

    const logs = loadLogs();

    // Overstyr console.time / console.timeEnd for å fange timings
    const timers = {};
    const origTime = console.time.bind(console);
    const origTimeEnd = console.timeEnd.bind(console);
    const origLog = console.log.bind(console);
    const origError = console.error.bind(console);

    console.time = function (label) {
        timers[label] = performance.now();
        origTime(label);
    };

    console.timeEnd = function (label) {
        origTimeEnd(label);
        if (timers[label] !== undefined) {
            const ms = (performance.now() - timers[label]).toFixed(1);
            addLog(`⏱ ${label}: ${ms}ms`);
            delete timers[label];
        }
    };

    // Fang console.log som starter med "viewteam"
    console.log = function (...args) {
        origLog(...args);
        const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
        if (msg.startsWith("viewteam")) {
            addLog(msg);
        }
    };

    // Fang errors
    console.error = function (...args) {
        origError(...args);
        const msg = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
        addLog("ERROR: " + msg);
    };

    // Fang uventede feil
    window.addEventListener("error", function (e) {
        addLog("UNCAUGHT: " + e.message + " @ " + (e.filename || "").split("/").pop() + ":" + e.lineno);
    });

    window.addEventListener("unhandledrejection", function (e) {
        addLog("PROMISE: " + (e.reason?.message || e.reason || "unknown"));
    });

    // Logg sideinnlasting
    addLog("--- Side lastet ---");

    function addLog(msg) {
        const ts = new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
        logs.push(`[${ts}] ${msg}`);
        while (logs.length > maxLogs) logs.shift();
        saveLogs(logs);
        updatePanel();
    }

    // Lag UI
    const btn = document.createElement("div");
    btn.textContent = "i";
    Object.assign(btn.style, {
        position: "fixed", bottom: "12px", right: "12px", zIndex: "99999",
        width: "32px", height: "32px", borderRadius: "50%",
        background: "rgba(255,255,255,0.15)", color: "#aaa",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "16px", fontFamily: "serif", fontStyle: "italic",
        cursor: "pointer", backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.2)",
        userSelect: "none", WebkitTapHighlightColor: "transparent"
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
        position: "fixed", bottom: "52px", right: "12px", zIndex: "99998",
        width: "min(90vw, 360px)", maxHeight: "50vh", overflowY: "auto",
        background: "rgba(0,0,0,0.95)", color: "#0f0",
        fontSize: "11px", fontFamily: "monospace", lineHeight: "1.5",
        padding: "10px", borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.15)",
        display: "none", whiteSpace: "pre-wrap", wordBreak: "break-word",
        WebkitOverflowScrolling: "touch"
    });

    const clearBtn = document.createElement("div");
    clearBtn.textContent = "Tøm logg";
    Object.assign(clearBtn.style, {
        position: "sticky", top: "0", textAlign: "right",
        color: "#f88", cursor: "pointer", fontSize: "11px", paddingBottom: "6px",
        background: "rgba(0,0,0,0.95)"
    });
    clearBtn.onclick = function (e) {
        e.stopPropagation();
        logs.length = 0;
        saveLogs(logs);
        updatePanel();
    };

    const content = document.createElement("div");
    panel.appendChild(clearBtn);
    panel.appendChild(content);

    function updatePanel() {
        if (panel.style.display === "none") return;
        content.textContent = logs.length ? logs.join("\n") : "(ingen logg ennå)";
        panel.scrollTop = panel.scrollHeight;
    }

    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        const visible = panel.style.display !== "none";
        panel.style.display = visible ? "none" : "block";
        if (!visible) updatePanel();
    }, { passive: false });

    document.body.appendChild(panel);
    document.body.appendChild(btn);
})();
