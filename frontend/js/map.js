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

// ================= LAYER LOGIC =================
function setBaseLayer(type) {
    map.removeLayer(roadsLayer);
    map.removeLayer(satelliteLayer);

    if (type === "roads") roadsLayer.addTo(map);
    if (type === "satellite") satelliteLayer.addTo(map);
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
        }
        if (ach.type === "location" && progress.locationsVisited >= ach.count) {
            progress.unlockedAchievements.push(ach.id);
        }
    });
    saveTravelProgress(progress);
}

// ================= USER LOCATION =================
let userMarker = null;
let userLat = null;
let userLng = null;
let geolocationWatchId = null;

function onLocationUpdate(position) {
    const { latitude, longitude } = position.coords;

    const progress = getTravelProgress();
    if (progress.lastPosition) {
        const dist = haversineDistance(
            progress.lastPosition.lat, progress.lastPosition.lng,
            latitude, longitude
        );
        progress.totalDistance += dist;
    }
    progress.lastPosition = { lat: latitude, lng: longitude };
    saveTravelProgress(progress);
    checkAndUnlockAchievements(progress);

    userLat = latitude;
    userLng = longitude;

    if (!userMarker) {
        userMarker = L.marker([latitude, longitude]).addTo(map);
        map.setView([latitude, longitude], 14);
    } else {
        userMarker.setLatLng([latitude, longitude]);
    }

    claimTerritory(latitude, longitude);
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

    button.onclick = e => {
        e.preventDefault();
        if (userLat != null && userLng != null) {
            map.setView([userLat, userLng], 14);
        } else {
            startGeolocation(true);
        }
    };

    return button;
};

locateControl.addTo(map);

// ================= CLICK SYSTEM =================
let clickMarker = null;
let pathLine = null;

map.on("click", async (e) => {

    const { lat, lng } = e.latlng;

    if (!clickMarker) clickMarker = L.marker([lat, lng]).addTo(map);
    else clickMarker.setLatLng([lat, lng]);

    clickMarker.bindPopup("Loading...").openPopup();

    try {
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const geoData = await geoRes.json();

        const locationName =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.state ||
            geoData.address?.country ||
            "Unknown Location";

        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&timezone=auto`
        );
        const weatherData = await weatherRes.json();

        const temperature = weatherData.current_weather?.temperature ?? "N/A";
        const localTime = weatherData.current_weather?.time ?? "N/A";

        let imageUrl = "";
        try {
            const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(locationName)}`
            );
            const wikiData = await wikiRes.json();
            imageUrl = wikiData.thumbnail?.source || "";
        } catch {}

        if (!imageUrl) imageUrl = "https://picsum.photos/400/250";

        if (userLat && userLng) {
            if (pathLine) pathLine.remove();
            pathLine = L.polyline(
                [[userLat, userLng], [lat, lng]],
                { color: '#1d6fdc', weight: 2, dashArray: '6,6' }
            ).addTo(map);
        }

        const progress = getTravelProgress();
        progress.locationsVisited = (progress.locationsVisited || 0) + 1;
        saveTravelProgress(progress);
        checkAndUnlockAchievements(progress);

        const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (currentUser) {
            currentUser.xp = (currentUser.xp || 0) + 10;
            setCurrentUser(currentUser);
            const xpEl = document.getElementById("xp-value");
            if (xpEl) xpEl.textContent = currentUser.xp;
        }

        clickMarker.setPopupContent(`
            <div class="map-popup">
                <b>${locationName}</b><br><br>
                <img src="${imageUrl}" style="width:100%;border-radius:8px;margin-bottom:8px;">
                <div><strong>Temperature:</strong> ${temperature} °C</div>
                <div><strong>Local Time:</strong> ${localTime}</div>
            </div>
        `);

    } catch {
        clickMarker.setPopupContent("Failed to load data.");
    }
});

// ================= USER BUTTONS =================

document.addEventListener("DOMContentLoaded", () => {

    const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // If not logged in → go to login page
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // Explore button - starts geolocation (one permission request) and zooms to user
    const exploreBtn = document.getElementById("exploreBtn");
    if (exploreBtn) {
        exploreBtn.addEventListener("click", () => {
            if (userLat != null && userLng != null) {
                map.setView([userLat, userLng], 14);
            } else {
                startGeolocation(true);
            }
        });
    }

    // Set XP
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