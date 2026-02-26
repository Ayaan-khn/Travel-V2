// ================= PLANS PAGE LOGIC =================

let currentPlanTab = 'my';
let myPlans = [];
let joinedPlans = [];
let publicPlans = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    loadPlans();
    renderPlans();
});

// Load plans - try API first, fallback to localStorage
async function loadPlans() {
    const my = localStorage.getItem('myPlans');
    if (my) myPlans = JSON.parse(my);
    
    const joined = localStorage.getItem('joinedPlans');
    if (joined) joinedPlans = JSON.parse(joined);
    
    const pub = localStorage.getItem('publicPlans');
    if (pub) publicPlans = JSON.parse(pub);
    
    // Try to fetch from API
    try {
        const apiPlans = await getPlansAPI('public');
        if (apiPlans && apiPlans.length > 0) {
            publicPlans = apiPlans.map(p => ({
                id: p.id,
                destination: p.destination,
                dates: p.dates,
                purpose: p.purpose,
                description: p.description,
                openToJoin: p.open_to_join === 1,
                spots: p.spots,
                totalSpots: p.total_spots,
                organizer: {
                    name: p.creator_name || 'Unknown',
                    photo: p.photo_url || 'https://i.pravatar.cc/150?img=1'
                }
            }));
            savePlans();
        }
    } catch (error) {
        console.log('Could not fetch plans from API');
    }
    
    // If no plans exist, add sample data
    if (myPlans.length === 0 && joinedPlans.length === 0 && publicPlans.length === 0) {
        initializeSamplePlans();
    }
    
    renderPlans();
}

// Save plans to localStorage
function savePlans() {
    localStorage.setItem('myPlans', JSON.stringify(myPlans));
    localStorage.setItem('joinedPlans', JSON.stringify(joinedPlans));
    localStorage.setItem('publicPlans', JSON.stringify(publicPlans));
}

// Initialize sample plans
function initializeSamplePlans() {
    const user = getCurrentUser();
    const userName = user ? user.name : 'You';
    
    myPlans = [
        {
            id: 1,
            destination: "Manali, India",
            dates: "Dec 20 - Dec 27",
            purpose: "Winter Adventure",
            openToJoin: true,
            spots: 3,
            totalSpots: 5,
            description: "Planning a winter trip to the beautiful mountains of Manali. Will include trekking, snow activities, and local exploration!",
            status: 'planned'
        }
    ];
    
    joinedPlans = [
        {
            id: 101,
            destination: "Bali, Indonesia",
            dates: "Jan 5 - Jan 15",
            purpose: "Digital Detox Retreat",
            openToJoin: true,
            organizer: { name: "Lisa Chen", photo: "https://i.pravatar.cc/150?img=9" },
            spots: 2,
            totalSpots: 8,
            description: "A relaxing retreat focused on meditation, yoga, and disconnecting from technology."
        }
    ];
    
    publicPlans = [
        {
            id: 201,
            destination: "Paris, France",
            dates: "Feb 10 - Feb 14",
            purpose: "Valentine's Getaway",
            openToJoin: false,
            organizer: { name: "Sophie Martin", photo: "https://i.pravatar.cc/150?img=20" },
            spots: 0,
            totalSpots: 2,
            description: "Romantic Valentine's trip for couples. Already fully booked!"
        },
        {
            id: 202,
            destination: "Tokyo, Japan",
            dates: "Mar 15 - Mar 25",
            purpose: "Cherry Blossom Season",
            openToJoin: true,
            organizer: { name: "Yuki Tanaka", photo: "https://i.pravatar.cc/150?img=16" },
            spots: 3,
            totalSpots: 5,
            description: "Experience the magical cherry blossom season in Japan! Visit Tokyo, Kyoto, and Osaka."
        },
        {
            id: 203,
            destination: "Barcelona, Spain",
            dates: "Apr 5 - Apr 12",
            purpose: "Spring Festival",
            openToJoin: true,
            organizer: { name: "Carlos Rodriguez", photo: "https://i.pravatar.cc/150?img=15" },
            spots: 4,
            totalSpots: 6,
            description: "Explore the vibrant culture, architecture, and food of Barcelona during spring festival."
        }
    ];
    
    savePlans();
}

// Switch plan tabs
function switchPlanTab(tab) {
    currentPlanTab = tab;
    
    document.querySelectorAll('.plan-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    renderPlans();
}

// Render plans based on current tab
function renderPlans() {
    const container = document.getElementById('plansContainer');
    container.innerHTML = '';
    
    let plans = [];
    
    switch(currentPlanTab) {
        case 'my':
            plans = myPlans;
            break;
        case 'joined':
            plans = joinedPlans;
            break;
        case 'public':
            plans = publicPlans;
            break;
    }
    
    if (plans.length === 0) {
        container.innerHTML = getEmptyStateHTML(currentPlanTab);
    } else {
        plans.forEach(plan => {
            container.innerHTML += createPlanCard(plan, currentPlanTab);
        });
    }
}

// Get empty state HTML
function getEmptyStateHTML(tab) {
    const configs = {
        my: {
            icon: '📋',
            title: 'No travel plans yet',
            text: 'Create your first travel plan and find companions!',
            btnText: '+ Create Plan',
            btnAction: 'createNewPlan()'
        },
        joined: {
            icon: '🤝',
            title: 'No joined trips',
            text: 'Join public trips or accept invitations to see them here!',
            btnText: 'Browse Public Trips',
            btnAction: "switchPlanTab('public')"
        },
        public: {
            icon: '🌍',
            title: 'No public trips available',
            text: 'Be the first to create a public trip!',
            btnText: '+ Create Plan',
            btnAction: 'createNewPlan()'
        }
    };
    
    const config = configs[tab];
    return `
        <div class="card" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">${config.icon}</div>
            <h3 style="margin-bottom: 8px;">${config.title}</h3>
            <p class="card-description">${config.text}</p>
            <div class="card-actions" style="justify-content: center; margin-top: 16px;">
                <button class="btn btn-primary" onclick="${config.btnAction}">${config.btnText}</button>
            </div>
        </div>
    `;
}

// Create plan card HTML
function createPlanCard(plan, tab) {
    const isJoined = joinedPlans.find(p => p.id === plan.id);
    const joinStatus = plan.openToJoin ? 
        '<span class="plan-status open">✅ Open</span>' : 
        '<span class="plan-status closed">🔒 Private</span>';
    
    let cardContent = '';
    
    if (tab === 'my') {
        cardContent = `
            <div class="plan-destination">✈️ ${plan.destination}</div>
            <div class="plan-dates">📅 ${plan.dates}</div>
            <span class="plan-purpose">${plan.purpose}</span>
            ${joinStatus}
            <p class="plan-description">${plan.description}</p>
            <div class="plan-spots">
                <span>👥 ${plan.spots} of ${plan.totalSpots} spots filled</span>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="editPlan(${plan.id})">✏️ Edit</button>
                <button class="btn btn-secondary" onclick="deletePlan(${plan.id})">🗑️ Delete</button>
                <button class="btn btn-secondary" onclick="togglePlanVisibility(${plan.id})">
                    ${plan.openToJoin ? '🔒 Make Private' : '✅ Make Public'}
                </button>
            </div>
        `;
    } else if (tab === 'joined') {
        cardContent = `
            <div class="plan-destination">✈️ ${plan.destination}</div>
            <div class="plan-dates">📅 ${plan.dates}</div>
            <span class="plan-purpose">${plan.purpose}</span>
            <p class="plan-description">${plan.description}</p>
            <div class="card-header">
                <img src="${plan.organizer.photo}" alt="${plan.organizer.name}" class="card-avatar">
                <div class="card-user-info">
                    <div class="card-username">${plan.organizer.name}</div>
                    <div class="card-meta">Trip Organizer</div>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-primary" style="background: #4caf50;">✅ Joined</button>
                <button class="btn btn-secondary" onclick="leaveTrip(${plan.id})">Leave Trip</button>
                <button class="btn btn-secondary" onclick="messageOrganizerPlan(${plan.id})">💬 Message</button>
            </div>
        `;
    } else {
        cardContent = `
            <div class="plan-destination">✈️ ${plan.destination}</div>
            <div class="plan-dates">📅 ${plan.dates}</div>
            <span class="plan-purpose">${plan.purpose}</span>
            ${joinStatus}
            <p class="plan-description">${plan.description}</p>
            <div class="card-header">
                <img src="${plan.organizer.photo}" alt="${plan.organizer.name}" class="card-avatar">
                <div class="card-user-info">
                    <div class="card-username">${plan.organizer.name}</div>
                    <div class="card-meta">${plan.spots} spots left</div>
                </div>
            </div>
            <div class="card-actions">
                ${plan.openToJoin && plan.spots > 0 ? 
                    `<button class="btn btn-primary" onclick="joinPublicPlan(${plan.id})">Join Trip</button>` : 
                    (plan.spots === 0 ? `<button class="btn btn-secondary" disabled>Full</button>` : 
                    `<button class="btn btn-secondary" disabled>Private</button>`)
                }
                <button class="btn btn-secondary" onclick="messageOrganizerPlan(${plan.id})">💬 Message</button>
            </div>
        `;
    }
    
    return `<div class="card plan-card">${cardContent}</div>`;
}

// Create new plan
function createNewPlan() {
    const destination = prompt('Enter destination:');
    if (!destination) return;
    
    const dates = prompt('Enter dates (e.g., Dec 20 - Dec 27):');
    if (!dates) return;
    
    const purpose = prompt('Enter purpose (e.g., Winter Adventure):');
    if (!purpose) return;
    
    const description = prompt('Enter description:');
    
    const newPlan = {
        id: Date.now(),
        destination,
        dates,
        purpose,
        description: description || '',
        openToJoin: true,
        spots: 1,
        totalSpots: 5,
        status: 'planned'
    };
    
    myPlans.push(newPlan);
    savePlans();
    renderPlans();
    showToast('🎉 Plan created successfully!');
}

// Edit plan
function editPlan(id) {
    const plan = myPlans.find(p => p.id === id);
    if (!plan) return;
    
    const destination = prompt('Edit destination:', plan.destination);
    if (destination === null) return;
    
    const dates = prompt('Edit dates:', plan.dates);
    if (dates === null) return;
    
    const purpose = prompt('Edit purpose:', plan.purpose);
    if (purpose === null) return;
    
    const description = prompt('Edit description:', plan.description);
    
    plan.destination = destination;
    plan.dates = dates;
    plan.purpose = purpose;
    plan.description = description || '';
    
    savePlans();
    renderPlans();
    showToast('✏️ Plan updated!');
}

// Delete plan
function deletePlan(id) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    myPlans = myPlans.filter(p => p.id !== id);
    savePlans();
    renderPlans();
    showToast('🗑️ Plan deleted');
}

// Toggle plan visibility
function togglePlanVisibility(id) {
    const plan = myPlans.find(p => p.id === id);
    if (!plan) return;
    
    plan.openToJoin = !plan.openToJoin;
    savePlans();
    renderPlans();
    showToast(plan.openToJoin ? '✅ Plan is now public!' : '🔒 Plan is now private');
}

// Join public plan
function joinPublicPlan(id) {
    const plan = publicPlans.find(p => p.id === id);
    if (!plan) return;
    
    if (!confirm(`Join trip to ${plan.destination}?`)) return;
    
    joinedPlans.push(plan);
    plan.spots--;
    publicPlans = publicPlans.filter(p => p.id !== id);
    savePlans();
    renderPlans();
    showToast(`✈️ Joined trip to ${plan.destination}!`);
}

// Leave trip
function leaveTrip(id) {
    if (!confirm('Are you sure you want to leave this trip?')) return;
    
    const plan = joinedPlans.find(p => p.id === id);
    if (plan) {
        plan.spots++;
        publicPlans.push(plan);
    }
    joinedPlans = joinedPlans.filter(p => p.id !== id);
    savePlans();
    renderPlans();
    showToast('Left the trip');
}

// Message organizer
function messageOrganizerPlan(id) {
    let plan = joinedPlans.find(p => p.id === id) || publicPlans.find(p => p.id === id);
    if (!plan) return;
    
    startConversation(plan.organizer);
}

// Start conversation
function startConversation(user) {
    let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
    let conv = conversations.find(c => c.participantName === user.name);
    
    if (!conv) {
        conv = {
            id: Date.now(),
            participantId: user.name,
            participantName: user.name,
            participantPhoto: user.photo,
            messages: [],
            lastMessage: '',
            lastMessageTime: Date.now()
        };
        conversations.push(conv);
    }
    
    localStorage.setItem('conversations', JSON.stringify(conversations));
    window.location.href = 'messages.html';
}

// Show toast
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
