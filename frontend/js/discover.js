// ================= DISCOVER PAGE LOGIC =================

// Current state
let currentTab = 'experiences';
let savedProfiles = [];
let savedExperiences = [];
let joinedExperiences = [];
let joinedTrips = [];

// Real data from API
let realExperiences = [];
let realPlans = [];
let nearbyUsers = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    loadUserData();
    loadRealData();
    loadUserLocation();
});

// Load real data from API
async function loadRealData() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = '<div class="loading-card">Loading...</div>';
    
    try {
        // Fetch experiences from API
        realExperiences = await getExperiencesAPI();
    } catch (error) {
        console.log('API not available, using sample data');
    }
    
    renderFeed();
}

// Load user data from localStorage
function loadUserData() {
    const saved = localStorage.getItem('savedProfiles');
    if (saved) savedProfiles = JSON.parse(saved);
    
    const savedExp = localStorage.getItem('savedExperiences');
    if (savedExp) savedExperiences = JSON.parse(savedExp);
    
    const joinedExp = localStorage.getItem('joinedExperiences');
    if (joinedExp) joinedExperiences = JSON.parse(joinedExp);
    
    const joined = localStorage.getItem('joinedTrips');
    if (joined) joinedTrips = JSON.parse(joined);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('savedProfiles', JSON.stringify(savedProfiles));
    localStorage.setItem('savedExperiences', JSON.stringify(savedExperiences));
    localStorage.setItem('joinedExperiences', JSON.stringify(joinedExperiences));
    localStorage.setItem('joinedTrips', JSON.stringify(joinedTrips));
}

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
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    renderFeed();
}

// Render the feed based on current tab
function renderFeed() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = '';
    
    let cards = [];
    
    // Show real experiences if available, otherwise sample
    const experiences = realExperiences.length > 0 ? realExperiences : sampleExperiences;
    
    switch(currentTab) {
        case 'people':
            cards = samplePeople.map(person => createPeopleCard(person));
            break;
        case 'experiences':
            cards = experiences.map(exp => createExperienceCard(exp));
            break;
        case 'nearby':
            cards = [
                ...samplePeople.slice(0, 2).map(person => createPeopleCard(person)),
                ...experiences.slice(0, 2).map(exp => createExperienceCard(exp))
            ];
            break;
        case 'trending':
            cards = [
                ...sampleTrips.map(trip => createTripCard(trip)),
                ...sampleLegends.slice(0, 2).map(legend => createLegendCard(legend))
            ];
            break;
    }
    
    if (cards.length === 0) {
        container.innerHTML = `
            <div class="empty-state-card">
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <h3 style="margin-bottom: 8px;">Nothing here yet</h3>
                <p>Check back later for more content!</p>
            </div>
        `;
    } else {
        cards.forEach(card => {
            container.innerHTML += card;
        });
    }
}

// Sample data
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
    },
    {
        id: 4,
        name: "Alex Kim",
        age: 30,
        photo: "https://i.pravatar.cc/150?img=8",
        distance: "3.5 km away",
        languages: ["🇰🇷", "🇺🇸", "🇯🇵"],
        interests: ["🎮 Gaming", "🍣 Sushi", "✈️ Travel"],
        bio: "Software developer taking a year off to travel. Love gaming and sushi!",
        travelStatus: "Digital Nomad",
        status: "traveling"
    },
    {
        id: 5,
        name: "Lisa Chen",
        age: 27,
        photo: "https://i.pravatar.cc/150?img=9",
        distance: "4.0 km away",
        languages: ["🇨🇳", "🇺🇸", "🇬🇧"],
        interests: ["💼 Business", "🏋️ Fitness", "🍷 Wine"],
        bio: "Investment banker who loves to travel. Always looking for new adventures!",
        travelStatus: "Frequent Traveler",
        status: "visiting"
    }
];

const sampleExperiences = [
    {
        id: 1,
        title: "Anyone for coffee this afternoon?",
        creator: { name: "Alex Kim", photo: "https://i.pravatar.cc/150?img=8" },
        location: "Blue Bottle Coffee",
        date: "Today, 3:00 PM",
        description: "Looking for someone to join me for coffee and good conversation. I'm a software developer who loves meeting new people!",
        participants: 3,
        maxParticipants: 6,
        category: "coffee"
    },
    {
        id: 2,
        title: "Sunset Yoga in Central Park",
        creator: { name: "Emma Wilson", photo: "https://i.pravatar.cc/150?img=5" },
        location: "Central Park, near Bethesda Fountain",
        date: "Tomorrow, 6:30 PM",
        description: "Free yoga session open to all levels. Bring your own mat! Let's welcome the sunset together.",
        participants: 8,
        maxParticipants: 15,
        category: "yoga"
    },
    {
        id: 3,
        title: "Street Photography Walk",
        creator: { name: "Marco Silva", photo: "https://i.pravatar.cc/150?img=3" },
        location: "SoHo District",
        date: "Saturday, 10:00 AM",
        description: "Join me for a 2-hour street photography walk. All camera types welcome - even phone cameras!",
        participants: 4,
        maxParticipants: 8,
        category: "photography"
    },
    {
        id: 4,
        title: "Food Tour - Best Tacos in Town",
        creator: { name: "Carlos Rodriguez", photo: "https://i.pravatar.cc/150?img=15" },
        location: "Various locations",
        date: "Sunday, 12:00 PM",
        description: "Let's explore the best taco spots in the city! I'll show you hidden gems only locals know about.",
        participants: 6,
        maxParticipants: 10,
        category: "food"
    }
];

const sampleTrips = [
    {
        id: 1,
        destination: "Manali, India",
        dates: "Dec 20 - Dec 27",
        purpose: "Winter Adventure",
        openToJoin: true,
        creator: { name: "Raj Patel", photo: "https://i.pravatar.cc/150?img=12" },
        spots: 3,
        totalSpots: 6
    },
    {
        id: 2,
        destination: "Bali, Indonesia",
        dates: "Jan 5 - Jan 15",
        purpose: "Digital Detox Retreat",
        openToJoin: true,
        creator: { name: "Lisa Chen", photo: "https://i.pravatar.cc/150?img=9" },
        spots: 4,
        totalSpots: 8
    },
    {
        id: 3,
        destination: "Paris, France",
        dates: "Feb 10 - Feb 14",
        purpose: "Valentine's Getaway",
        openToJoin: false,
        creator: { name: "Sophie Martin", photo: "https://i.pravatar.cc/img=20" },
        spots: 0,
        totalSpots: 2
    },
    {
        id: 4,
        destination: "Tokyo, Japan",
        dates: "Mar 15 - Mar 25",
        purpose: "Cherry Blossom Season",
        openToJoin: true,
        creator: { name: "Yuki Tanaka", photo: "https://i.pravatar.cc/150?img=16" },
        spots: 2,
        totalSpots: 5
    }
];

const sampleLegends = [
    {
        id: 1,
        place: "Kashmir Valley",
        image: "../../assets/Kashmir Valley.png",
        mood: "mystical",
        moodLabel: "Mystical",
        teaser: "Ancient tales speak of a hidden kingdom beneath the frozen lakes..."
    },
    {
        id: 2,
        place: "Aberdeen, Scotland",
        image: "../../assets/Aberdeen.png",
        mood: "haunted",
        moodLabel: "Haunted",
        teaser: "The Greyfriars Kirkyard holds secrets that have terrified locals for centuries..."
    }
];

// Create People Card HTML
function createPeopleCard(person) {
    const isSaved = savedProfiles.includes(person.id);
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
            
            <div class="people-languages">${languages}</div>
            <div class="people-interests">${interests}</div>
            <div class="travel-status">✈️ ${person.travelStatus}</div>
            <p class="people-bio">"${person.bio}"</p>
            
            <div class="card-actions">
                <button class="btn btn-primary" onclick="sayHi(${person.id})">👋 Say Hi</button>
                <button class="btn btn-secondary" onclick="meetUp(${person.id})">☕ Meet</button>
                <button class="btn btn-secondary" onclick="exploreTogether(${person.id})">🧭 Explore</button>
                <button class="btn ${isSaved ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="toggleSaveProfile(${person.id})"
                        style="${isSaved ? 'background: #4caf50; color: white;' : ''}">
                    ${isSaved ? '❤️ Saved' : '🤍 Save'}
                </button>
            </div>
        </div>
    `;
}

// Create Experience Card HTML
function createExperienceCard(experience) {
    const isJoined = joinedExperiences.includes(experience.id);
    // Handle both API response (participants_count) and sample data (participants)
    const participants = experience.participants_count || experience.participants || 0;
    const maxParticipants = experience.max_participants || experience.maxParticipants || 10;
    const isFull = participants >= maxParticipants;
    const category = experience.category || 'other';
    
    // Handle creator - API returns flat fields (creator_name, photo_url), sample data has nested object
    const creatorName = experience.creator_name || experience.creator?.name || 'Host';
    const creatorPhoto = experience.photo_url || experience.creator?.photo || 'https://i.pravatar.cc/150?img=1';
    
    return `
        <div class="card experience-card">
            <span class="experience-category">${getCategoryIcon(category)} ${capitalizeFirst(category)}</span>
            <h3 class="experience-title">${experience.title}</h3>
            
            <div class="experience-header">
                <img src="${creatorPhoto}" alt="${creatorName}" class="card-avatar">
                <div class="card-user-info">
                    <div class="card-username">${creatorName}</div>
                    <div class="card-meta">Host</div>
                </div>
            </div>
            
            <div class="experience-meta">
                <span class="experience-meta-item">📍 ${experience.location || 'Location TBD'}</span>
                <span class="experience-meta-item">🕐 ${experience.date_time || experience.date || 'TBD'}</span>
            </div>
            
            <p class="card-description">${experience.description || 'No description provided.'}</p>
            
            <div class="card-details">
                <span class="participant-count ${isFull ? 'full' : ''}">
                    👥 ${participants}/${maxParticipants} ${isFull ? '(Full)' : 'joined'}
                </span>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-primary" 
                        onclick="joinExperience(${experience.id})"
                        ${isFull || isJoined ? 'disabled' : ''}>
                    ${isJoined ? '✅ Joined' : (isFull ? 'Full' : 'Join')}
                </button>
                <button class="btn btn-secondary" onclick="chatHost(${experience.id}, '${escapeHtml(creatorName)}')">💬 Chat</button>
                <button class="btn btn-secondary" onclick="saveExperience(${experience.id})">
                    ${savedExperiences.includes(experience.id) ? '💚 Saved' : '🤍 Save'}
                </button>
            </div>
        </div>
    `;
}

// Create Trip Plan Card HTML
function createTripCard(trip) {
    const isJoined = joinedTrips.includes(trip.id);
    const joinStatus = trip.openToJoin ? 
        '<span class="open-to-join yes">✅ Open to Join</span>' : 
        '<span class="open-to-join no">🔒 Private</span>';
    
    return `
        <div class="card trip-plan-card">
            <div class="destination">🏔️ ${trip.destination}</div>
            <div class="trip-dates">📅 ${trip.dates}</div>
            <span class="trip-purpose">${trip.purpose}</span>
            ${joinStatus}
            
            <div class="card-header">
                <img src="${trip.creator.photo}" alt="${trip.creator.name}" class="card-avatar">
                <div class="card-user-info">
                    <div class="card-username">${trip.creator.name}</div>
                    <div class="card-meta">${trip.spots} spots left of ${trip.totalSpots}</div>
                </div>
            </div>
            
            <div class="card-actions">
                ${trip.openToJoin && !isJoined ? 
                    `<button class="btn btn-primary" onclick="joinTrip(${trip.id}, '${escapeHtml(trip.destination)}')">Join Trip</button>` : 
                    (isJoined ? `<button class="btn btn-primary" style="background: #4caf50;">✅ Joined</button>` :
                    `<button class="btn btn-secondary" disabled>Private</button>`)
                }
                <button class="btn btn-secondary" onclick="viewTripDetails(${trip.id})">View Details</button>
                <button class="btn btn-secondary" onclick="messageOrganizer(${trip.id}, '${escapeHtml(trip.creator.name)}')">Message</button>
            </div>
        </div>
    `;
}

// Create Legend Card HTML
function createLegendCard(legend) {
    return `
        <div class="card legend-card">
            <img src="${legend.image}" alt="${legend.place}" class="card-image"
                 onerror="this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'">
            <span class="legend-mood ${legend.mood}">${legend.moodLabel}</span>
            <h3 class="card-title">${legend.place}</h3>
            <p class="legend-teaser">${legend.teaser}</p>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="readLegend(${legend.id})">📜 Read Legend</button>
            </div>
        </div>
    `;
}

// Helper functions
function getCategoryIcon(category) {
    const icons = {
        coffee: '☕',
        yoga: '🧘',
        photography: '📸',
        food: '🍜',
        hiking: '🏔️',
        music: '🎵',
        art: '🎨',
        other: '🎯'
    };
    return icons[category] || icons.other;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Action functions
function sayHi(id) {
    const person = samplePeople.find(p => p.id === id);
    startConversation(person);
}

function meetUp(id) {
    const person = samplePeople.find(p => p.id === id);
    showToast(`☕ Meet up request sent to ${person.name}!`);
}

function exploreTogether(id) {
    const person = samplePeople.find(p => p.id === id);
    showToast(`🧭 Exploration request sent to ${person.name}!`);
}

function toggleSaveProfile(id) {
    if (savedProfiles.includes(id)) {
        savedProfiles = savedProfiles.filter(p => p !== id);
        showToast('Profile removed from saved');
    } else {
        savedProfiles.push(id);
        showToast('❤️ Profile saved!');
    }
    saveData();
    renderFeed();
}

function joinExperience(id) {
    const experiences = realExperiences.length > 0 ? realExperiences : sampleExperiences;
    const exp = experiences.find(e => e.id === id);
    if (!joinedExperiences.includes(id)) {
        joinedExperiences.push(id);
        if (exp) exp.participants++;
        saveData();
        renderFeed();
        startConversation(exp?.creator || {name: 'Host', photo: 'https://i.pravatar.cc/150?img=1'});
        showToast(`✅ Joined "${exp?.title}"! Chat opened.`);
    }
}

function chatHost(id, hostName) {
    const experiences = realExperiences.length > 0 ? realExperiences : sampleExperiences;
    const exp = experiences.find(e => e.id === id);
    startConversation(exp?.creator || {name: 'Host', photo: 'https://i.pravatar.cc/150?img=1'});
}

function saveExperience(id) {
    if (savedExperiences.includes(id)) {
        savedExperiences = savedExperiences.filter(e => e !== id);
        showToast('Experience removed from saved');
    } else {
        savedExperiences.push(id);
        showToast('💚 Experience saved!');
    }
    saveData();
    renderFeed();
}

function joinTrip(id, destination) {
    const trip = sampleTrips.find(t => t.id === id);
    if (!joinedTrips.includes(id)) {
        joinedTrips.push(id);
        trip.spots--;
        saveData();
        renderFeed();
        startConversation(trip.creator);
        showToast(`✈️ Joined trip to ${destination}! Chat opened with organizer.`);
    }
}

function viewTripDetails(id) {
    const trip = sampleTrips.find(t => t.id === id);
    showToast(`📋 Trip to ${trip.destination}: ${trip.dates}\n${trip.purpose}\n\nOrganized by ${trip.creator.name}`);
}

function messageOrganizer(id, name) {
    const trip = sampleTrips.find(t => t.id === id);
    startConversation(trip.creator);
}

function readLegend(id) {
    window.location.href = 'legends.html';
}

// Start conversation with user
function startConversation(user) {
    let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    const currentUser = getCurrentUser();
    
    // Check if conversation already exists
    let conv = conversations.find(c => c.participantId === user.name || c.participantName === user.name);
    
    if (!conv) {
        conv = {
            id: Date.now(),
            participantId: user.name,
            participantName: user.name,
            participantPhoto: user.photo || 'https://i.pravatar.cc/150?img=1',
            messages: [],
            lastMessage: '',
            lastMessageTime: Date.now()
        };
        conversations.push(conv);
    }
    
    localStorage.setItem('conversations', JSON.stringify(conversations));
    window.location.href = 'messages.html';
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function openSearch() {
    showToast('🔍 Search feature coming soon!');
}

function openFilters() {
    showToast('⚙️ Filters coming soon!');
}

// Show create experience modal
function showCreateExperienceModal() {
    const modal = document.createElement('div');
    modal.className = 'create-modal show';
    modal.id = 'createExperienceModal';
    modal.innerHTML = `
        <div class="create-modal-content">
            <div class="create-modal-header">
                <h3>Create Experience</h3>
                <button class="create-modal-close" onclick="closeCreateModal()">×</button>
            </div>
            <div class="create-modal-body">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="expTitle" placeholder="e.g., Coffee meetup">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="expCategory">
                        <option value="coffee">☕ Coffee</option>
                        <option value="food">🍜 Food</option>
                        <option value="yoga">🧘 Yoga</option>
                        <option value="photography">📸 Photography</option>
                        <option value="hiking">🏔️ Hiking</option>
                        <option value="music">🎵 Music</option>
                        <option value="art">🎨 Art</option>
                        <option value="other">🎯 Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="expLocation" placeholder="Where?">
                </div>
                <div class="form-group">
                    <label>Date & Time</label>
                    <input type="text" id="expDateTime" placeholder="e.g., Tomorrow 3PM">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="expDescription" placeholder="Tell people about your experience..."></textarea>
                </div>
                <div class="form-group">
                    <label>Max Participants</label>
                    <input type="number" id="expMaxParticipants" value="10" min="2" max="50">
                </div>
            </div>
            <div class="create-modal-footer">
                <button class="btn btn-secondary" onclick="closeCreateModal()">Cancel</button>
                <button class="btn btn-primary" onclick="createExperience()">Create</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeCreateModal() {
    const modal = document.getElementById('createExperienceModal');
    if (modal) {
        modal.remove();
    }
}

async function createExperience() {
    const title = document.getElementById('expTitle').value;
    const category = document.getElementById('expCategory').value;
    const location = document.getElementById('expLocation').value;
    const dateTime = document.getElementById('expDateTime').value;
    const description = document.getElementById('expDescription').value;
    const maxParticipants = parseInt(document.getElementById('expMaxParticipants').value) || 10;
    
    if (!title) {
        showToast('Please enter a title');
        return;
    }
    
    const user = getCurrentUser();
    
    // Try to save to API first
    try {
        const result = await createExperienceAPI({
            title,
            category,
            location,
            date_time: dateTime,
            description,
            max_participants: maxParticipants
        });
        
        // Add to local state
        const newExp = {
            id: result.id,
            title,
            category,
            location,
            date_time: dateTime,
            description,
            participants_count: 1,
            max_participants: maxParticipants,
            creator_name: user?.name || 'You',
            photo_url: user?.photo_url || 'https://i.pravatar.cc/150?img=1'
        };
        
        realExperiences.unshift(newExp);
        closeCreateModal();
        renderFeed();
        showToast('✅ Experience created!');
    } catch (error) {
        // Fallback to local only
        const newExp = {
            id: Date.now(),
            title,
            category,
            location,
            date_time: dateTime,
            description,
            participants: 1,
            maxParticipants,
            creator: {
                name: user?.name || 'You',
                photo: user?.photo_url || 'https://i.pravatar.cc/150?img=1'
            }
        };
        
        sampleExperiences.unshift(newExp);
        closeCreateModal();
        renderFeed();
        showToast('✅ Experience created!');
    }
}
