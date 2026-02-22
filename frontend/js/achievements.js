// 1. Data Initialization
let travelData = JSON.parse(localStorage.getItem('travelAppProgress')) || {
    totalDistance: 0,
    locationsVisited: 0,
    unlockedAchievements: [],
    lastPosition: null
};

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

    milestoneDefinitions.forEach(ach => {
        const isUnlocked = travelData.unlockedAchievements.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

        let progressHTML = '';
        if (!isUnlocked && ach.threshold) {
            progressHTML = `<div class="progress-text">${Math.floor(travelData.totalDistance)}/${ach.threshold}km</div>`;
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
    if (!travelData.unlockedAchievements.includes(id)) {
        travelData.unlockedAchievements.push(id);
        localStorage.setItem('travelAppProgress', JSON.stringify(travelData));
        renderAchievements();
        // You can add a toast notification here
    }
}

// Check distance achievements
function checkMilestones() {
    milestoneDefinitions.forEach(ach => {
        if (ach.type === 'distance' && travelData.totalDistance >= ach.threshold) {
            unlockAchievement(ach.id);
        }
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    renderAchievements();
    // Simulate initial check
    checkMilestones();
});