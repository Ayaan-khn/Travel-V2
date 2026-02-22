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
    { attribution: '&copy; OpenRailwayMap contributors', maxZoom: 19 }
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

// ================= USER LOCATION =================
let userMarker = null;
let userLat = null;
let userLng = null;

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(position => {

        const { latitude, longitude } = position.coords;
        userLat = latitude;
        userLng = longitude;

        if (!userMarker) {
            userMarker = L.marker([latitude, longitude]).addTo(map);
            map.setView([latitude, longitude], 14);
        } else {
            userMarker.setLatLng([latitude, longitude]);
        }

        claimTerritory(latitude, longitude);

    },
    error => console.error("Geolocation error:", error),
    { enableHighAccuracy: true });
}

// ================= LOCATE BUTTON =================
const locateControl = L.control({ position: 'bottomright' });

locateControl.onAdd = () => {
    const button = L.DomUtil.create('button', 'locate-btn');
    button.innerHTML = "ME";

    button.onclick = e => {
        e.preventDefault();
        if (userLat && userLng) map.setView([userLat, userLng], 14);
        else alert("Location not available yet.");
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

    // Set XP
    const xpEl = document.getElementById("xp-value");
    if (xpEl) xpEl.textContent = currentUser.xp || 0;

    // Set Profile Picture
    const pfp = document.getElementById("topPfp");
    if (pfp) {
        pfp.src = currentUser.profilePic || "https://i.pravatar.cc/100";

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

// ================= LOGOUT =================

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}