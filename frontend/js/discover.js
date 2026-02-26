// ================= DISCOVER PAGE LOGIC =================

// Sample data for demonstration
const samplePeople = [
    {
        id: 1,
        name: "Sarah Chen",
        age: 28,
        photo: "https://i.pravatar.cc/150?img=1",
        distance: "2.3 km away",
        languages: ["🇺🇸", "🇪🇸"],
        interests: ["🎸 Music", "🏔️ Hiking", "☕ Coffee"],
        bio: "Digital nomad exploring the world one city at a time. Love meeting new people!",
        travelStatus: "Currently in NYC",
        status: "traveling"
    },
    {
        id: 2,
        name: "Marco Silva",
        age: 32,
        photo: "https://i.pravatar.cc/150?img=3",
        distance: "5.1 km away",
        languages: ["🇧🇷", "🇺🇸", "🇮🇹"],
        interests: ["📸 Photography", "🍜 Food", "🎨 Art"],
        bio: "Photographer and food lover. Always looking for the best local spots!",
        travelStatus: "Visiting for a week",
        status: "visiting"
    },
    {
        id: 3,
        name: "Emma Wilson",
        age: 25,
        photo: "https://i.pravatar.cc/150?img=5",
        distance: "1.2 km away",
        languages: ["🇬🇧", "🇫🇷"],
        interests: ["🧘 Yoga", "📚 Books", "🌱 Vegan"],
        bio: "Yoga instructor & book enthusiast. Let's grab a healthy smoothie!",
        travelStatus: "Local resident",
        status: "local"
    }
];

const sampleExperiences = [
    {
        id: 1,
        title: "Anyone for coffee this afternoon?",
        creator: {
            name: "Alex Kim",
            photo: "https://i.pravatar.cc/150?img=8"
        },
        location: "Blue Bottle Coffee",
        date: "Today, 3:00 PM",
        description: "Looking for someone to join me for coffee and good conversation. I'm a software developer who loves meeting new people!",
        participants: 3,
        maxParticipants: 6
    },
    {
        id: 2,
        title: "Sunset Yoga in Central Park",
        creator: {
            name: "Emma Wilson",
            photo: "https://i.pravatar.cc/150?img=5"
        },
        location: "Central Park, near Bethesda Fountain",
        date: "Tomorrow, 6:30 PM",
        description: "Free yoga session open to all levels. Bring your own mat! Let's welcome the sunset together.",
        participants: 8,
        maxParticipants: 15
    },
    {
        id: 3,
        title: "Street Photography Walk",
        creator: {
            name: "Marco Silva",
            photo: "https://i.pravatar.cc/150?img=3"
        },
        location: "SoHo District",
        date: "Saturday, 10:00 AM",
        description: "Join me for a 2-hour street photography walk. All camera types welcome - even phone cameras!",
        participants: 4,
        maxParticipants: 8
    }
];

const sampleTrips = [
    {
        id: 1,
        destination: "Manali, India",
        dates: "Dec 20 - Dec 27",
        purpose: "Winter Adventure",
        openToJoin: true,
        creator: {
            name: "Raj Patel",
            photo: "https://i.pravatar.cc/150?img=12"
        }
    },
    {
        id: 2,
        destination: "Bali, Indonesia",
        dates: "Jan 5 - Jan 15",
        purpose: "Digital Detox Retreat",
        openToJoin: true,
        creator: {
            name: "Lisa Chen",
            photo: "https://i.pravatar.cc/150?img=9"
        }
    },
    {
        id: 3,
        destination: "Paris, France",
        dates: "Feb 10 - Feb 14",
        purpose: "Valentine's Getaway",
        openToJoin: false,
        creator: {
            name: "Sophie Martin",
            photo: "https://i.pravatar.cc/150?img=20"
        }
    }
];

const sampleLegends = [
    {
        id: 1,
        place: "Kashmir Valley",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        mood: "mystical",
        moodLabel: "Mystical",
        teaser: "Ancient tales speak of a hidden kingdom beneath the frozen lakes, waiting for the worthy to discover its secrets..."
    },
    {
        id: 2,
        place: "Aberdeen, Scotland",
        image: "https://images.unsplash.com/photo-1506368083636-6defb67639a7?w=400",
        mood: "haunted",
        moodLabel: "Haunted",
        teaser: "The Greyfriars Kirkyard holds secrets that have terrified locals for centuries. Some say the Mackenzie Poltergeist is still searching..."
    },
    {
        id: 3,
        place: "Kyoto, Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
        mood: "peaceful",
        moodLabel: "Peaceful",
        teaser: "In the bamboo groves of Arashiyama, monks have practiced meditation for over a thousand years, achieving enlightenment..."
    },
    {
        id: 4,
        place: "Patagonia, Chile",
        image: "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=400",
        mood: "adventurous",
        moodLabel: "Adventurous",
        teaser: "Legend says the mountains themselves guide those brave enough to climb them to hidden treasures of the ancients..."
    }
];

// Current state
let currentTab = 'people';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    requireAuth();
    
    // Load initial feed
    renderFeed();
    
    // Set up location (placeholder)
    loadUserLocation();
});

// Load user's location
function loadUserLocation() {
    const user = getCurrentUser();
    if (user && user.city) {
        document.getElementById('currentLocation').textContent = user.city;
    }
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Re-render feed
    renderFeed();
}

// Render the feed based on current tab
function renderFeed() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = '';
    
    let cards = [];
    
    switch(currentTab) {
        case 'people':
            cards = samplePeople.map(person => createPeopleCard(person));
            break;
        case 'experiences':
            cards = sampleExperiences.map(exp => createExperienceCard(exp));
            break;
        case 'nearby':
            // Mix of nearby people and experiences
            cards = [
                ...samplePeople.slice(0, 2).map(person => createPeopleCard(person)),
                ...sampleExperiences.slice(0, 2).map(exp => createExperienceCard(exp))
            ];
            break;
        case 'trending':
            cards = [
                ...sampleTrips.map(trip => createTripCard(trip)),
                ...sampleLegends.map(legend => createLegendCard(legend))
            ];
            break;
    }
    
    // Add cards to container
    cards.forEach(card => {
        container.innerHTML += card;
    });
}

// Create People Card HTML
function createPeopleCard(person) {
    const interests = person.interests.map(interest => 
        `<span class="interest-tag">${interest}</span>`
    ).join('');
    
    const languages = person.languages.map(lang => 
        `<span class="language-flag">${lang}</span>`
    ).join('');
    
    return `
        <div class="card people-card">
            <div class="card-header">
                <img src="${person.photo}" alt="${person.name}" class="card-avatar">
                <div class="card-user-info">
                    <div class="people-info">
                        <span class="people-name">${person.name}</span>
                        <span class="people-age">${person.age}</span>
                    </div>
                    <div class="card-meta">
                        <span class="people-distance">📍 ${person.distance}</span>
                    </div>
                </div>
            </div>
            
            <div class="people-languages">
                ${languages}
            </div>
            
            <div class="people-interests">
                ${interests}
            </div>
            
            <div class="travel-status">
                ✈️ ${person.travelStatus}
            </div>
            
            <p class="people-bio">"${person.bio}"</p>
            
            <div class="card-actions">
                <button class="btn btn-primary" onclick="sayHi(${person.id})">👋 Say Hi</button>
                <button class="btn btn-secondary" onclick="meetUp(${person.id})">☕ Meet</button>
                <button class="btn btn-secondary" onclick="exploreTogether(${person.id})">🧭 Explore</button>
                <button class="btn btn-secondary" onclick="saveProfile(${person.id})">❤️ Save</button>
            </div>
        </div>
    `;
}

// Create Experience Card HTML
function createExperienceCard(experience) {
    return `
        <div class="card experience-card">
            <h3 class="experience-title">${experience.title}</h3>
            
            <div class="experience-header">
                <img src="${experience.creator.photo}" alt="${experience.creator.name}" class="card-avatar">
                <div class="card-user-info">
                    <div class="card-username">${experience.creator.name}</div>
                    <div class="card-meta">Host</div>
                </div>
            </div>
            
            <div class="experience-meta">
                <span class="experience-meta-item">📍 ${experience.location}</span>
                <span class="experience-meta-item">🕐 ${experience.date}</span>
            </div>
            
            <p class="card-description">${experience.description}</p>
            
            <div class="card-details">
                <span class="participant-count">
                    👥 ${experience.participants}/${experience.maxParticipants} joined
                </span>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-primary" onclick="joinExperience(${experience.id})">Join</button>
                <button class="btn btn-secondary" onclick="chatHost(${experience.id})">💬 Chat</button>
                <button class="btn btn-secondary" onclick="saveExperience(${experience.id})">Save</button>
            </div>
        </div>
    `;
}

// Create Trip Plan Card HTML
function createTripCard(trip) {
    const joinStatus = trip.openToJoin ? 
        '<span class="open-to-join yes">✅ Open to Join</span>' : 
        '<span class="open-to-join no">🔒 Private</span>';
    
    return `
        <div class="card trip-plan-card">
            <div class="destination">
                🏔️ ${trip.destination}
            </div>
            
            <div class="trip-dates">
                📅 ${trip.dates}
            </div>
            
            <span class="trip-purpose">${trip.purpose}</span>
            
            ${joinStatus}
            
            <div class="card-header">
                <img src="${trip.creator.photo}" alt="${trip.creator.name}" class="card-avatar">
                <div class="card-user-info">
                    <div class="card-username">${trip.creator.name}</div>
                    <div class="card-meta">Trip Organizer</div>
                </div>
            </div>
            
            <div class="card-actions">
                ${trip.openToJoin ? 
                    `<button class="btn btn-primary" onclick="joinTrip(${trip.id})">Join Trip</button>` : 
                    `<button class="btn btn-secondary" disabled>Join Trip</button>`
                }
                <button class="btn btn-secondary" onclick="viewTripDetails(${trip.id})">View Details</button>
                <button class="btn btn-secondary" onclick="messageOrganizer(${trip.id})">Message</button>
            </div>
        </div>
    `;
}

// Create Legend Card HTML
function createLegendCard(legend) {
    return `
        <div class="card legend-card">
            <img src="${legend.image}" alt="${legend.place}" class="card-image">
            
            <span class="legend-mood ${legend.mood}">${legend.moodLabel}</span>
            
            <h3 class="card-title">${legend.place}</h3>
            
            <p class="legend-teaser">${legend.teaser}</p>
            
            <div class="card-actions">
                <button class="btn btn-primary" onclick="readLegend(${legend.id})">📜 Read Legend</button>
            </div>
        </div>
    `;
}

// Action functions
function sayHi(id) {
    alert(`Saying hi to person #${id}!`);
}

function meetUp(id) {
    alert(`Setting up a meet with person #${id}!`);
}

function exploreTogether(id) {
    alert(`Starting exploration with person #${id}!`);
}

function saveProfile(id) {
    alert(`Profile #${id} saved!`);
}

function joinExperience(id) {
    alert(`Joining experience #${id}!`);
}

function chatHost(id) {
    alert(`Starting chat for experience #${id}!`);
}

function saveExperience(id) {
    alert(`Experience #${id} saved!`);
}

function joinTrip(id) {
    alert(`Joining trip #${id}!`);
}

function viewTripDetails(id) {
    alert(`Viewing details for trip #${id}!`);
}

function messageOrganizer(id) {
    alert(`Messaging trip organizer #${id}!`);
}

function readLegend(id) {
    alert(`Reading legend #${id}!`);
}

function openSearch() {
    alert('Search feature coming soon!');
}

function openFilters() {
    alert('Filters coming soon!');
}
