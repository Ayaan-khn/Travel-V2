// 1. Storage util (per-user progress)
function getProgressKey() {
    const user = getCurrentUser();
    return "travelAppProgress_" + (user?.username || "guest");
}

function getTravelData() {
    return JSON.parse(localStorage.getItem(getProgressKey())) || {
        totalDistance: 0,
        locationsVisited: 0,
        unlockedAchievements: [],
        lastPosition: null
    };
}

let travelData = getTravelData();

// 2. Achievement List
const milestoneDefinitions = [
    { id: 'first_loc', name: 'First Explorer', icon: '🌍', desc: 'Visited your first location', type: 'location', count: 1 },
    { id: 'dist_10', name: 'Nomad Initiate', icon: '🚶', desc: 'Traveled 10 km', type: 'distance', threshold: 10 },
    { id: 'dist_100', name: 'Road Warrior', icon: '🚲', desc: 'Traveled 100 km', type: 'distance', threshold: 100 },
    { id: 'dist_1000', name: 'Globetrotter', icon: '✈️', desc: 'Traveled 1,000 km', type: 'distance', threshold: 1000 },
    { id: 'heat_seeker', name: 'Heat Seeker', icon: '🔥', desc: 'Explored 5 places', type: 'location', count: 5 },
    { id: 'terrain_forest', name: 'Forest Expert', icon: '🌲', desc: 'Master of the woodlands', type: 'special' },
    { id: 'terrain_desert', name: 'Desert Master', icon: '🏜️', desc: 'Conqueror of the sands', type: 'special' },
    { id: 'terrain_mountain', name: 'Peak Performer', icon: '🏔️', desc: 'Reached the highest peaks', type: 'special' }
];

// 3. Render Engine
function renderAchievements() {
    const grid = document.getElementById('achievement-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const data = getTravelData();
    travelData = data;
    milestoneDefinitions.forEach(ach => {
        const isUnlocked = data.unlockedAchievements.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        let progressHTML = '';
        if (!isUnlocked && ach.type === "distance" && ach.threshold) {
            progressHTML = `<div class="progress-text">${Math.floor(data.totalDistance)}/${ach.threshold}km</div>`;
        }
        if (!isUnlocked && ach.type === "location" && ach.count) {
            progressHTML = `<div class="progress-text">${data.locationsVisited || 0}/${ach.count} places</div>`;
        }

        card.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
            ${progressHTML}
        `;
        grid.appendChild(card);
    });

    updateProgressBar();
}

function updateProgressBar() {
    const earned = travelData.unlockedAchievements.length;
    const total = milestoneDefinitions.length;
    const percent = (earned / total) * 100;
    const bar = document.getElementById('main-progress-bar');
    if (bar) bar.style.width = `${percent}%`;
}

// 4. Persistence & Logic
function unlockAchievement(id) {
    const data = getTravelData();
    if (!data.unlockedAchievements.includes(id)) {
        data.unlockedAchievements.push(id);
        localStorage.setItem(getProgressKey(), JSON.stringify(data));
        travelData = data;
        renderAchievements();
    }
}

// Check all achievement types (distance, location, special)
function checkMilestones() {
    const data = getTravelData();
    travelData = data;
    let changed = false;
    milestoneDefinitions.forEach(ach => {
        if (data.unlockedAchievements.includes(ach.id)) return;
        if (ach.type === "distance" && data.totalDistance >= (ach.threshold || 0)) {
            data.unlockedAchievements.push(ach.id);
            changed = true;
        }
        if (ach.type === "location" && data.locationsVisited >= (ach.count || 1)) {
            data.unlockedAchievements.push(ach.id);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem(getProgressKey(), JSON.stringify(data));
        renderAchievements();
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    if (!getCurrentUser()) {
        window.location.href = "login.html";
        return;
    }
    travelData = getTravelData();
    checkMilestones();
    renderAchievements();
});