// MAN WOMEN DOT
const dotIcon = L.divIcon({
    className: "user-dot",
    html: `<div style="
        width:14px;
        height:14px;
        background:#1d6fdc;
        border-radius:50%;
        border:2px solid white;
    "></div>`
});

const manIcon = L.divIcon({
    className: "avatar-icon",
    html: `
        <div class="avatar-wrapper">
            <img src="../../assets/icons/man.png">
        </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

const womanIcon = L.divIcon({
    className: "avatar-icon",
    html: `
        <div class="avatar-wrapper">
            <img src="../../assets/icons/woman.png">
        </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

// ================= MAP INIT =================
const map = L.map('map', {
    worldCopyJump: true,
    minZoom: 3,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1.0
}).setView([20.5937, 78.9629], 5);

// ================= TILE LAYERS =================
const roadsLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors', maxZoom: 20 }
);

const railwayLayer = L.tileLayer(
    'https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenRailwayMap | Data &copy; OpenStreetMap',
        maxZoom: 19,
        minZoom: 4,
        subdomains: 'abc',
        zIndexOffset: 1000,
        crossOrigin: true
    }
);
const darkLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '&copy; CartoDB' }
);

const satelliteLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri' }
);

roadsLayer.addTo(map);

// ================= 3D BUILDINGS =================
let buildingsLayer = null;
const threeDLayer = L.layerGroup();

threeDLayer.on('add', () => {
    if (!buildingsLayer) {
        buildingsLayer = new OSMBuildings(map).date(new Date()).load();
        buildingsLayer.setStyle({
            color: '#8a8a8a',
            roofColor: '#b5b5b5',
            opacity: 0.8
        });
    }
});

threeDLayer.on('remove', () => {
    if (buildingsLayer) {
        map.removeLayer(buildingsLayer);
        buildingsLayer = null;
    }
});

// ================= THEME CONTROL =================
const themeControl = L.control({ position: 'bottomright' });

themeControl.onAdd = () => {

    const button = L.DomUtil.create('button', 'theme-btn');

    button.innerHTML = `
        <svg id="themeIcon" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/>
        </svg>
    `;

    L.DomEvent.disableClickPropagation(button);

    button.onclick = () => {
        toggleTheme();
    };

    return button;
};

themeControl.addTo(map);

// ================= LAYER BUTTON =================
const layerToggleControl = L.control({ position: 'bottomright' });

layerToggleControl.onAdd = () => {
    const button = L.DomUtil.create('button', 'layer-btn');
    button.title = "Layers";
    L.DomEvent.disableClickPropagation(button);

    button.onclick = () => {
        document.getElementById("layerPanel")?.classList.toggle("show");
    };

    return button;
};

layerToggleControl.addTo(map);

// ================= LAYER PANEL BINDINGS =================
document.addEventListener("DOMContentLoaded", function initLayerPanel() {
    document.querySelector("#baseRoads")?.addEventListener("change", function() {
        if (this.checked) setBaseLayer("roads");
    });
    document.querySelector("#baseSatellite")?.addEventListener("change", function() {
        if (this.checked) setBaseLayer("satellite");
    });
    const baseRoads = document.querySelector("#baseRoads");
    if (baseRoads) baseRoads.checked = true;

    document.querySelector("#overlayRailway")?.addEventListener("change", function() {
        toggleOverlay("railway");
    });
    document.querySelector("#overlay3d")?.addEventListener("change", function() {
        toggleOverlay("3d");
    });
});

const markerRadios = document.querySelectorAll('input[name="markerType"]');

markerRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        localStorage.setItem("markerType", radio.value);
        updateUserMarker();
    });
});

function updateUserMarker() {

    const type = localStorage.getItem("markerType") || "dot";

    if (!userMarker) return;

    if (type === "dot") userMarker.setIcon(dotIcon);
    if (type === "man") userMarker.setIcon(manIcon);
    if (type === "woman") userMarker.setIcon(womanIcon);
}
// ================= THEME SYSTEM =================

function applyDarkMode() {
    document.body.classList.add("dark-mode");
    if (map.hasLayer(roadsLayer)) map.removeLayer(roadsLayer);
    if (!map.hasLayer(darkLayer)) darkLayer.addTo(map);
    localStorage.setItem("theme", "dark");
}

function applyLightMode() {
    document.body.classList.remove("dark-mode");
    if (map.hasLayer(darkLayer)) map.removeLayer(darkLayer);
    if (!map.hasLayer(roadsLayer)) roadsLayer.addTo(map);
    localStorage.setItem("theme", "light");
}

function toggleTheme() {
    if (document.body.classList.contains("dark-mode")) {
        applyLightMode();
    } else {
        applyDarkMode();
    }
}

// ================= LAYER LOGIC =================
function setBaseLayer(type) {
    map.removeLayer(roadsLayer);
    map.removeLayer(satelliteLayer);

    if (type === "roads") roadsLayer.addTo(map);
    if (type === "satellite") satelliteLayer.addTo(map);
}
// Restore saved theme
if (localStorage.getItem("theme") === "dark") {
    applyDarkMode();
}

function toggleOverlay(type) {
    if (type === "railway") {
        map.hasLayer(railwayLayer)
            ? map.removeLayer(railwayLayer)
            : railwayLayer.addTo(map);
    }

    if (type === "3d") {
        map.hasLayer(threeDLayer)
            ? map.removeLayer(threeDLayer)
            : threeDLayer.addTo(map);
    }
}

// ================= TERRITORY SYSTEM (VISUAL ONLY) =================
let claimedTerritories =
    JSON.parse(localStorage.getItem("claimedTerritories")) || {};

function getCellKey(lat, lng) {
    const cellSize = 0.005;
    const latCell = Math.floor(lat / cellSize);
    const lngCell = Math.floor(lng / cellSize);
    return `${latCell}_${lngCell}`;
}

function drawTerritory(lat, lng) {
    L.circle([lat, lng], {
        radius: 250,
        color: "#FFD700",
        fillColor: "#FFD700",
        fillOpacity: 0.25,
        weight: 2
    }).addTo(map);
}

function claimTerritory(lat, lng) {
    const key = getCellKey(lat, lng);
    if (claimedTerritories[key]) return;

    claimedTerritories[key] = { lat, lng };
    // ===== XP FOR NEW TERRITORY =====
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (currentUser) {

    const xpGain = 20;

    currentUser.xp = (currentUser.xp || 0) + xpGain;

    localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
    setCurrentUser(currentUser);

    const xpEl = document.getElementById("xp-value");
    if (xpEl) xpEl.textContent = currentUser.xp;
}
    localStorage.setItem("claimedTerritories", JSON.stringify(claimedTerritories));
    drawTerritory(lat, lng);
}

for (const key in claimedTerritories) {
    const t = claimedTerritories[key];
    drawTerritory(t.lat, t.lng);
}

// ================= TRAVEL PROGRESS (for achievements) =================
function getProgressKey() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    return "travelAppProgress_" + (user?.username || "guest");
}

function getTravelProgress() {
    return JSON.parse(localStorage.getItem(getProgressKey())) || {
        totalDistance: 0,
        locationsVisited: 0,
        unlockedAchievements: [],
        lastPosition: null
    };
}

function saveTravelProgress(progress) {
    localStorage.setItem(getProgressKey(), JSON.stringify(progress));
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// simple heuristic for "best season" based on hemisphere and current month
function getBestSeason(lat) {
    const month = new Date().getMonth() + 1; // 1-12
    const north = lat >= 0;
    let season = "";
    if (north) {
        if (month >= 3 && month <= 5) season = "Spring";
        else if (month >= 6 && month <= 8) season = "Summer";
        else if (month >= 9 && month <= 11) season = "Autumn";
        else season = "Winter";
    } else {
        // southern hemisphere seasons are opposite
        if (month >= 3 && month <= 5) season = "Autumn";
        else if (month >= 6 && month <= 8) season = "Winter";
        else if (month >= 9 && month <= 11) season = "Spring";
        else season = "Summer";
    }
    return season;
}

function checkAndUnlockAchievements(progress) {
    const definitions = [
        { id: "first_loc", type: "location", count: 1 },
        { id: "dist_10", type: "distance", threshold: 10 },
        { id: "dist_100", type: "distance", threshold: 100 },
        { id: "dist_1000", type: "distance", threshold: 1000 },
        { id: "heat_seeker", type: "location", count: 5 }
    ];
    definitions.forEach(ach => {
        if (progress.unlockedAchievements.includes(ach.id)) return;
        if (ach.type === "distance" && progress.totalDistance >= ach.threshold) {

    progress.unlockedAchievements.push(ach.id);

    // ===== XP FOR ACHIEVEMENT =====
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (currentUser) {

        const xpRewardMap = {
            first_loc: 50,
            dist_10: 100,
            dist_100: 300,
            dist_1000: 800,
            heat_seeker: 150
        };

        const xpGain = xpRewardMap[ach.id] || 100;

        currentUser.xp = (currentUser.xp || 0) + xpGain;

        localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
        setCurrentUser(currentUser);

        const xpEl = document.getElementById("xp-value");
        if (xpEl) xpEl.textContent = currentUser.xp;
    }
}
        if (ach.type === "location" && progress.locationsVisited >= ach.count) {

    progress.unlockedAchievements.push(ach.id);

    // ===== XP FOR ACHIEVEMENT =====
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (currentUser) {

        const xpRewardMap = {
            first_loc: 50,
            dist_10: 100,
            dist_100: 300,
            dist_1000: 800,
            heat_seeker: 150
        };

        const xpGain = xpRewardMap[ach.id] || 100;

        currentUser.xp = (currentUser.xp || 0) + xpGain;

        localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
        setCurrentUser(currentUser);

        const xpEl = document.getElementById("xp-value");
        if (xpEl) xpEl.textContent = currentUser.xp;
    }
}
    });
    saveTravelProgress(progress);
}

// ================= USER LOCATION =================
let userMarker = null;
let userLat = null;
let userLng = null;
let geolocationWatchId = null;

// flag used to know if the user has started exploring (geolocation active)
let exploring = false;

// custom icon for click marker (makes marker more prominent, app-like)
const clickIcon = L.divIcon({
    className: 'click-icon',
    html: `<div class="click-circle"></div>`,
    iconSize: [24,24],
    iconAnchor: [12,12]
});

// helper: attempt to fetch thumbnail, extract and title from closest Wiki pages
// returns object {title,image,description}
async function fetchNearbyInfo(lat, lng) {
    try {
        const url = `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}|${lng}&ggsradius=20000&ggslimit=10&prop=pageimages|extracts&exintro&explaintext&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.query && data.query.pages) {
            // generator returns pages sorted by distance, so first hit is nearest
            for (const id in data.query.pages) {
                const pg = data.query.pages[id];
                if (pg.extract || (pg.thumbnail && pg.thumbnail.source)) {
                    return {
                        title: pg.title || '',
                        image: pg.thumbnail?.source || '',
                        description: pg.extract || ''
                    };
                }
            }
        }
    } catch (e) {
        console.warn('nearest info fetch failed', e);
    }
    return { title: '', image: '', description: '' };
}

function showExploreNotification() {

  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = "Exploration Started - Tracking your journey";
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function onLocationUpdate(position) {
    const { latitude, longitude } = position.coords;

    const progress = getTravelProgress();
   if (progress.lastPosition) {

    const dist = haversineDistance(
        progress.lastPosition.lat,
        progress.lastPosition.lng,
        latitude,
        longitude
    );

    // ALWAYS track total distance
    progress.totalDistance += dist;

    // ===== XP FROM WALKING DISTANCE =====
    // Ignore tiny GPS drift (< 50 meters)

    if (dist > 0.05) {

        const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

        if (currentUser) {

            const xpGain = Math.floor(dist * 100); // ≈ 1 XP per 10 m

            if (xpGain > 0) {

                currentUser.xp = (currentUser.xp || 0) + xpGain;

                localStorage.setItem(
                    "loggedInUser",
                    JSON.stringify(currentUser)
                );

                setCurrentUser(currentUser);

                const xpEl = document.getElementById("xp-value");
                if (xpEl) xpEl.textContent = currentUser.xp;
            }
        }
    }
}
    progress.lastPosition = { lat: latitude, lng: longitude };
    // ===== REAL EXPLORATION SYSTEM =====
// Count unique areas visited (GPS based)

const cellSize = 0.005; // ~500 meters
const latCell = Math.floor(latitude / cellSize);
const lngCell = Math.floor(longitude / cellSize);
const cellKey = `${latCell}_${lngCell}`;

if (!progress.visitedCells) progress.visitedCells = {};

if (!progress.visitedCells[cellKey]) {

    progress.visitedCells[cellKey] = true;

    progress.locationsVisited =
        (progress.locationsVisited || 0) + 1;

    saveTravelProgress(progress);
    checkAndUnlockAchievements(progress);
}

    userLat = latitude;
    userLng = longitude;

    if (!userMarker) {
        userMarker = L.marker([latitude, longitude], {
    icon: dotIcon
}).addTo(map);

updateUserMarker();
        map.setView([latitude, longitude], 14);
    } else {
        userMarker.setLatLng([latitude, longitude]);
    }

   if (progress.totalDistance > 0.1) { // >100m travelled
    claimTerritory(latitude, longitude);
}
}

function startGeolocation(zoomOnFirstFix) {
    if (!navigator.geolocation) return;
    if (geolocationWatchId !== null) {
        if (userLat != null && userLng != null && zoomOnFirstFix) {
            map.setView([userLat, userLng], 14);
        }
        return;
    }
    const exploreBtn = document.getElementById("exploreBtn");
    if (exploreBtn) exploreBtn.disabled = true;
    let hasZoomed = false;
    geolocationWatchId = navigator.geolocation.watchPosition(
        (pos) => {
            onLocationUpdate(pos);
            if (exploreBtn) exploreBtn.disabled = false;
            if (zoomOnFirstFix && !hasZoomed) {
                hasZoomed = true;
                map.setView([pos.coords.latitude, pos.coords.longitude], 14);
            }
        },
        (err) => {
            console.error("Geolocation error:", err);
            if (exploreBtn) exploreBtn.disabled = false;
            alert(err.code === 1 ? "Location permission denied." : "Unable to get your location.");
        },
        { enableHighAccuracy: true, maximumAge: 60000 }
    );
}

// ================= LOCATE BUTTON =================

const locateControl = L.control({ position: 'bottomright' });

locateControl.onAdd = () => {
    const button = L.DomUtil.create('button', 'locate-btn');
    button.innerHTML = "ME";

    L.DomEvent.disableClickPropagation(button);

    L.DomEvent.on(button, 'click', L.DomEvent.stopPropagation)
              .on(button, 'click', L.DomEvent.preventDefault)
              .on(button, 'click', () => {

                  if (userLat != null && userLng != null) {
                      map.setView([userLat, userLng], 14);
                  } else {
                      startGeolocation(true);
                  }

              });

    return button;
};

locateControl.addTo(map);

const markerControl = L.control({ position: 'bottomright' });

markerControl.onAdd = () => {
    const button = L.DomUtil.create('button', 'marker-btn');
    button.innerHTML = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="white">
  <circle cx="12" cy="12" r="5"/>
</svg>
`;

    L.DomEvent.disableClickPropagation(button);

    L.DomEvent.on(button, 'click', L.DomEvent.stopPropagation)
              .on(button, 'click', L.DomEvent.preventDefault)
              .on(button, 'click', () => {
                  const panel = document.getElementById("markerPanel");
                  panel.classList.toggle("show");
              });

    return button;
};

markerControl.addTo(map);

// ================= SEARCH BUTTON =================
const searchControl = L.control({ position: 'topleft' });

searchControl.onAdd = () => {
    const button = L.DomUtil.create('button', 'search-btn');
    L.DomEvent.disableClickPropagation(button);

    button.onclick = () => {
    const panel = document.getElementById("searchPanel");
    const input = document.getElementById("searchInput");

    panel.classList.add("show");

    setTimeout(() => {
        input.focus();
        input.select(); // optional: selects existing text
    }, 200);
};

    return button;
};

searchControl.addTo(map);


// ================= CLICK SYSTEM =================
let clickMarker = null;
let pathLine = null;

map.on("click", async (e) => {

    const { lat, lng } = e.latlng;

    if (!clickMarker) {
        clickMarker = L.marker([lat, lng], { icon: clickIcon }).addTo(map);
        clickMarker._icon.classList.add('bounce');
        setTimeout(() => clickMarker?._icon?.classList.remove('bounce'), 800);
    } else {
        clickMarker.setLatLng([lat, lng]);
    }

    clickMarker.bindPopup("Loading...").openPopup();

    try {
        let locationName = "Unknown Location";
        let geoData = {};
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            geoData = await geoRes.json();
            locationName =
                geoData.address?.city ||
                geoData.address?.town ||
                geoData.address?.village ||
                geoData.address?.state ||
                geoData.address?.country ||
                locationName;
        } catch (e) {
            console.warn('reverse geocode failed', e);
        }

        let temperature = "N/A";
        let localTime = "N/A";
        try {
            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`
            );
            const weatherData = await weatherRes.json();
            temperature = weatherData.current_weather?.temperature ?? temperature;
            localTime = weatherData.current_weather?.time ?? localTime;
        } catch (e) {
            console.warn('weather fetch failed', e);
        }

        let description = "";
        let fallbackTitle = "";
        try {
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(locationName)}`
            );
            const wikiData = await wikiRes.json();
            description = wikiData.extract || "";
        } catch (e) {
            console.warn('wiki summary failed', e);
        }

        if (!description) {
            try {
                const nearby = await fetchNearbyInfo(lat, lng);
                if (nearby.title) fallbackTitle = nearby.title;
                if (!description) description = nearby.description;
            } catch (e) {
                console.warn('nearby info fetch failed', e);
            }
        }

        if (!description) description = "No additional information available.";

        function splitDesc(d) {
            const idx = d.indexOf('.');
            if (idx === -1) return { geography: d, history: 'No history available.' };
            const geo = d.slice(0, idx+1);
            let hist = d.slice(idx+1).trim();
            if (hist.length > 120) hist = hist.slice(0, 117) + '...';
            return { geography: geo, history: hist || 'No history available.' };
        }
        const { geography, history } = splitDesc(description);

        // retain line drawing but no distance text shown
        if (exploring && userLat != null && userLng != null) {
            const dist = haversineDistance(userLat, userLng, lat, lng);
            if (pathLine) pathLine.remove();
            pathLine = L.polyline(
                [[userLat, userLng], [lat, lng]],
                { color: '#ff7800', weight: 4, dashArray: '10,8' }
            ).addTo(map);
        }

        const season = getBestSeason(lat);

        let displayName = locationName;
        if (fallbackTitle) {
            displayName = `Nearest info: ${fallbackTitle}`;
        }

        const countryLangMap = {
            India: 'Hindi',
            France: 'French',
            Spain: 'Spanish',
            Germany: 'German',
            China: 'Mandarin',
            Japan: 'Japanese',
            USA: 'English',
            'United States': 'English'
        };
        let language = 'Unknown';
        const country = geoData.address?.country;
        if (country && countryLangMap[country]) language = countryLangMap[country];

        clickMarker.setPopupContent(`
            <div class="map-popup">
                <div class="popup-header"><b>${displayName}</b></div>
                <div><strong>Best season:</strong> ${season}</div>
                <div class="section-title">Geography</div>
                <div>${geography}</div>
                <div class="section-title">History</div>
                <div>${history}</div>
                <div><strong>Temperature:</strong> ${temperature} °C</div>
                <div><strong>Local Time:</strong> ${localTime}</div>
                <div><strong>Language:</strong> ${language}</div>
            </div>
        `);

    } catch (err) {
        console.warn('popup build error', err);
        clickMarker.setPopupContent(`
            <div class="map-popup">
                <div class="popup-header"><b>Information Unavailable</b></div>
                <div>No data could be retrieved for this location.</div>
            </div>
        `);
    }
});


document.addEventListener("DOMContentLoaded", () => {

    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // If not logged in → go to login page
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // Explore button - starts geolocation (one permission request) and zooms to user
 const exploreBtn = document.getElementById("exploreBtn");

// `exploring` is a global flag declared earlier

if (exploreBtn) {

  exploreBtn.addEventListener("click", () => {

    if (!exploring) {

      // ▶ START EXPLORATION
      startGeolocation(true);

      exploring = true;

      exploreBtn.classList.add("active");
      exploreBtn.textContent = "Stop Exploring";

      // 🔔 SHOW TOAST
      showExploreNotification();

    } else {

      // ⏹ STOP EXPLORATION
      if (geolocationWatchId !== null) {
        navigator.geolocation.clearWatch(geolocationWatchId);
        geolocationWatchId = null;
      }

      exploring = false;
      // remove any existing path line
      if (pathLine) {
          map.removeLayer(pathLine);
          pathLine = null;
      }

      exploreBtn.classList.remove("active");
      exploreBtn.textContent = "Start Exploring";
    }

  });

}  // Set XP
    const xpEl = document.getElementById("xp-value");
    if (xpEl) xpEl.textContent = currentUser.xp || 0;


    // Set Profile Picture (use pfp to match register/profile)
    const pfp = document.getElementById("topPfp");
    if (pfp) {
        pfp.src = currentUser.pfp || currentUser.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.username)}`;

        pfp.addEventListener("click", () => {
            window.location.href = "profile.html";
        });
    }

    // Achievement Click
    const achievementBtn = document.getElementById("title");
    if (achievementBtn) {
        achievementBtn.addEventListener("click", () => {
            window.location.href = "achievements.html";
        });
    }

});

// ================= SEARCH LOGIC =================
// ================= SEARCH LOGIC =================

let searchMarker = null;
let debounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {

    const panel = document.getElementById("searchPanel");
    const closeBtn = document.getElementById("closeSearchPanel");
    const input = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("searchSuggestions");
    const goBtn = document.getElementById("searchGoBtn");

    // ---- Close Panel ----
    closeBtn.addEventListener("click", () => {
        panel.classList.remove("show");
    });

    // ---- Execute Search (Arrow or Enter) ----
    async function executeSearch(query) {

        if (!query || query.length < 2) return;

        try {

            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`
            );

            const data = await res.json();
            if (!data.length) return;

            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            map.setView([lat, lon], 14);

            if (!searchMarker)
                searchMarker = L.marker([lat, lon]).addTo(map);
            else
                searchMarker.setLatLng([lat, lon]);

            panel.classList.remove("show");

        } catch (err) {
            console.error("Search failed:", err);
        }
    }

    // ---- Arrow Click ----
    goBtn.addEventListener("click", () => {
        executeSearch(input.value.trim());
    });

    // ---- Enter Key ----
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            executeSearch(input.value.trim());
        }
    });

    // ---- Live Suggestions ----
    input.addEventListener("input", () => {

        const query = input.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 3) {
            suggestionsBox.innerHTML = "";
            return;
        }

        debounceTimer = setTimeout(async () => {

            try {

                suggestionsBox.innerHTML = "Searching...";

                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=8`
                );

                const data = await res.json();

                suggestionsBox.innerHTML = "";

                if (!data.length) {
                    suggestionsBox.innerHTML = "No results found";
                    return;
                }

                data.forEach(place => {

                    const item = document.createElement("div");
                    item.className = "search-item";
                    item.textContent = place.display_name;

                    item.addEventListener("click", () => {

                        const lat = parseFloat(place.lat);
                        const lon = parseFloat(place.lon);

                        map.setView([lat, lon], 14);

                        if (!searchMarker)
                            searchMarker = L.marker([lat, lon]).addTo(map);
                        else
                            searchMarker.setLatLng([lat, lon]);

                        panel.classList.remove("show");
                    });

                    suggestionsBox.appendChild(item);
                });

            } catch (err) {
                console.error("Suggestion error:", err);
                suggestionsBox.innerHTML = "Search failed";
            }

        }, 400);
    });

});