// Debug overlay - diskret "i" knapp nede til høyre
(function () {
    const logs = [];
    const maxLogs = 100;

    // Overstyr console.time / console.timeEnd for å fange timings
    const timers = {};
    const origTime = console.time.bind(console);
    const origTimeEnd = console.timeEnd.bind(console);
    const origLog = console.log.bind(console);

    console.time = function (label) {
        timers[label] = performance.now();
        origTime(label);
    };

    console.timeEnd = function (label) {
        origTimeEnd(label);
        if (timers[label] !== undefined) {
            const ms = (performance.now() - timers[label]).toFixed(1);
            addLog(`${label}: ${ms}ms`);
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

    function addLog(msg) {
        const ts = new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        logs.push(`[${ts}] ${msg}`);
        if (logs.length > maxLogs) logs.shift();
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
        border: "1px solid rgba(255,255,255,0.2)"
    });

    const panel = document.createElement("div");
    Object.assign(panel.style, {
        position: "fixed", bottom: "52px", right: "12px", zIndex: "99998",
        width: "min(90vw, 360px)", maxHeight: "50vh", overflowY: "auto",
        background: "rgba(0,0,0,0.9)", color: "#0f0",
        fontSize: "11px", fontFamily: "monospace", lineHeight: "1.5",
        padding: "10px", borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.15)",
        display: "none", whiteSpace: "pre-wrap", wordBreak: "break-word"
    });

    const clearBtn = document.createElement("div");
    clearBtn.textContent = "Tøm";
    Object.assign(clearBtn.style, {
        position: "sticky", top: "0", textAlign: "right",
        color: "#888", cursor: "pointer", fontSize: "10px", paddingBottom: "4px"
    });
    clearBtn.onclick = function (e) {
        e.stopPropagation();
        logs.length = 0;
        updatePanel();
    };

    const content = document.createElement("div");
    panel.appendChild(clearBtn);
    panel.appendChild(content);

    function updatePanel() {
        if (panel.style.display === "none") return;
        content.textContent = logs.length ? logs.join("\n") : "(ingen logg ennå)";
        content.scrollTop = content.scrollHeight;
    }

    btn.onclick = function () {
        const visible = panel.style.display !== "none";
        panel.style.display = visible ? "none" : "block";
        if (!visible) updatePanel();
    };

    document.body.appendChild(panel);
    document.body.appendChild(btn);
})();
