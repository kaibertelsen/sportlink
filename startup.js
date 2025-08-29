
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
            klientid = "recow53F8WZHEh9lS"; // Sett klientid for EU
            
        }

       
       
        changeFlagg(standardCountry);
        
        getTournament(klientid);
        clientID = klientid;


    }else{
        //starte med å hente lokal pososjon
        checkLocation();

       //USA
       // checkLocation("8.8.8.8")

        //EU
        //checkLocation("91.198.174.192")



    }
    
}

function changeFlagg(countryCode){
    const el = document.getElementById("flagcountryicon");
    if(!el) return;
  
    const code = (countryCode || "NO").toUpperCase().trim();
    const urls = {
      NO: "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b03d127a60db315ee22298_round-flag-norway-.png",
      EU: "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b19604a36f1122cb814a54_round-flag-eu-.png"
    };
    const url = urls[code] || urls.NO;
  
    if (el.tagName === "IMG") {
      el.src = url;
      el.alt = code + " flag";
    } else {
      // div: bruk bakgrunnsbilde + a11y-attributter
      el.style.backgroundImage = `url("${url}")`;
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", code + " flag");
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



(function () {
    // --- Konfig ---
    const REGIONS = [
      {
        code: "NO",
        name: "Norge",
        icon: "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b03d127a60db315ee22298_round-flag-norway-.png",
      },
      {
        code: "EU",
        name: "Europa",
        icon: "https://cdn.prod.website-files.com/66f547dd445606c275070efb/68b19604a36f1122cb814a54_round-flag-eu-.png",
      },
    ];
    const STORAGE_KEY = "UserCountry";
  
    // --- Hjelpere ---
    const $ = (sel, root = document) => root.querySelector(sel);
    const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  
    function ensureStyles() {
        if (document.getElementById("__flag_dropdown_styles")) return;
      
        const css = `
          #__flag_dropdown {
            position: absolute;
            margin-top: 8px;
            min-width: 200px;
            background: #0f172a; /* mørk bakgrunn */
            border: 1px solid #1e293b;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,.4);
            padding: 6px;
            z-index: 2147483647;
            color: #fff; /* hvit tekst */
            font-family: inherit;
          }
          .__flag_option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 10px;
            cursor: pointer;
            color: #fff;
            transition: background 0.2s;
          }
          .__flag_option:hover,
          .__flag_option[aria-selected="true"] {
            background: #1e293b; /* litt lysere mørk */
          }
          .__flag_option img {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            flex: 0 0 22px;
          }
          .__flag_label {
            font-size: 14px;
            line-height: 1.2;
            color: #fff;
          }
          #flagcountryicon {
            cursor: pointer;
            border-radius: 50%;
            background-size: cover;
            background-position: center;
          }
        `;
        const style = document.createElement("style");
        style.id = "__flag_dropdown_styles";
        style.textContent = css;
        document.head.appendChild(style);
      }
      
  
    function createMenu() {
      const menu = document.createElement("div");
      menu.id = "__flag_dropdown";
      menu.setAttribute("role", "listbox");
      menu.setAttribute("aria-label", "Velg region");
      menu.hidden = true;
      document.body.appendChild(menu);
      return menu;
    }
  
    function setTriggerFlag(trigger, regionCode) {
      const region = REGIONS.find(r => r.code === regionCode) || REGIONS[0];
      if (!region) return;
  
      if (trigger.tagName === "IMG") {
        trigger.src = region.icon;
        trigger.alt = `${region.code} flag`;
        if (!trigger.width) trigger.width = 40;
        if (!trigger.height) trigger.height = 40;
      } else {
        trigger.style.backgroundImage = `url("${region.icon}")`;
        const rect = trigger.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          trigger.style.width = "40px";
          trigger.style.height = "40px";
        }
        trigger.setAttribute("aria-label", `${region.name} (${region.code})`);
        trigger.setAttribute("role", "button");
        trigger.setAttribute("tabindex", "0");
      }
      trigger.dataset.selectedCode = region.code;
    }
  
    function buildMenu(menu, trigger) {
      menu.innerHTML = "";
      const selectedCode = trigger.dataset.selectedCode;
  
      REGIONS.forEach(r => {
        const opt = document.createElement("div");
        opt.className = "__flag_option";
        opt.setAttribute("role", "option");
        opt.setAttribute("data-code", r.code);
        opt.setAttribute("tabindex", "-1");
        opt.setAttribute("aria-selected", String(selectedCode === r.code));
  
        opt.innerHTML = `
          <img src="${r.icon}" alt="${r.code} flag">
          <span class="__flag_label">${r.name} (${r.code})</span>
        `;
  
        on(opt, "click", () => chooseRegion(r.code, trigger, menu));
        on(opt, "keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            chooseRegion(r.code, trigger, menu);
          }
        });
  
        menu.appendChild(opt);
      });
    }
  
    function positionMenu(menu, trigger) {
        const rect = trigger.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
        const menuWidth = menu.offsetWidth || 200; // fallback
        const viewportWidth = window.innerWidth;
      
        // Standard: under til venstre kant av trigger
        let left = rect.left + scrollX;
      
        // Hvis ikke plass til høyre → skyv til venstre
        if (left + menuWidth > viewportWidth - 10) {
          left = rect.right + scrollX - menuWidth;
        }
      
        menu.style.left = `${left}px`;
        menu.style.top = `${rect.bottom + scrollY}px`;
      }
  
    function openMenu(trigger, menu) {
      buildMenu(menu, trigger);
      positionMenu(menu, trigger);
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      (menu.querySelector('[aria-selected="true"]') || menu.querySelector(".__flag_option"))?.focus();
      document.addEventListener("mousedown", clickOutsideOnce);
      document.addEventListener("keydown", keyNav);
    }
  
    function closeMenu(trigger, menu) {
      if (menu.hidden) return;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("mousedown", clickOutsideOnce);
      document.removeEventListener("keydown", keyNav);
      trigger.focus();
    }
  
    function toggleMenu(trigger, menu) {
      if (menu.hidden) openMenu(trigger, menu);
      else closeMenu(trigger, menu);
    }
  
    function clickOutsideOnce(e) {
      const menu = $("#__flag_dropdown");
      const trigger = $("#flagcountryicon");
      if (!menu || !trigger) return;
      if (!menu.contains(e.target) && e.target !== trigger) {
        closeMenu(trigger, menu);
      }
    }
  
    function keyNav(e) {
      const menu = $("#__flag_dropdown");
      if (!menu || menu.hidden) return;
      const items = Array.from(menu.querySelectorAll(".__flag_option"));
      const i = items.indexOf(document.activeElement);
  
      if (e.key === "Escape") {
        e.preventDefault();
        const trigger = $("#flagcountryicon");
        if (trigger) closeMenu(trigger, menu);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[Math.min(i + 1, items.length - 1)] || items[0])?.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[Math.max(i - 1, 0)] || items[items.length - 1])?.focus();
      }
      if (e.key === "Enter" || e.key === " ") {
        const el = document.activeElement;
        if (el && el.classList.contains("__flag_option")) {
          e.preventDefault();
          const code = el.getAttribute("data-code");
          const trigger = $("#flagcountryicon");
          if (trigger) chooseRegion(code, trigger, menu);
        }
      }
    }
  
    function chooseRegion(code, trigger, menu) {
      const regionCode = (code || "NO").toUpperCase();
  
      // 1) Oppdater trigger-ikon umiddelbart (visuell feedback)
      setTriggerFlag(trigger, regionCode);
  
      // 2) Lagre i localStorage med din nøkkel
      try { localStorage.setItem(STORAGE_KEY, regionCode); } catch (_) {}
  
      // 3) Kjør dine funksjoner i riktig rekkefølge:
      // - changeFlagg oppdaterer også ikonet i DOM (har du allerede gjort over, men ufarlig å kalle igjen)
      try { if (typeof changeFlagg === "function") changeFlagg(regionCode); } catch (_) {}
  
      // - startFirstFunctions leser UserCountry, setter klientid, roper videre osv.
      try { if (typeof startFirstFunctions === "function") startFirstFunctions(); } catch (_) {}
  
      // 4) Lukk meny
      closeMenu(trigger, menu);
    }
  
    function init() {
      ensureStyles();
  
      const trigger = $("#flagcountryicon");
      if (!trigger) return;
  
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
  
      const menu = createMenu();
  
      // Sett ikon etter lagret verdi, slik at tett integrasjon med startFirstFunctions() ikke brytes
      const saved = (localStorage.getItem(STORAGE_KEY) || "NO").toUpperCase();
      setTriggerFlag(trigger, saved);
  
      on(trigger, "click", () => toggleMenu(trigger, menu));
      on(trigger, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMenu(trigger, menu); }
        if (e.key === "ArrowDown") { e.preventDefault(); openMenu(trigger, menu); }
      });
  
      // Reposisjonering
      on(window, "resize", () => { if (!menu.hidden) positionMenu(menu, trigger); });
      on(window, "scroll", () => { if (!menu.hidden) positionMenu(menu, trigger); }, true);
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
  