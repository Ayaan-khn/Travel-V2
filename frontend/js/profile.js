// ================= PROFILE INIT =================
function initProfile() {

    const user = requireAuth();
    if (!user) return;

    const usernameEl = document.getElementById("username");
    const bioEl = document.getElementById("bioText");
    const profilePfp = document.getElementById("profilePfp");
    const banner = document.getElementById("profileBanner");

    if (usernameEl) usernameEl.textContent = user.username;
    if (bioEl) bioEl.textContent = user.bio || "No bio added yet. Click edit to add one!";
    if (profilePfp) profilePfp.src = user.pfp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;

    // Load user profile data
    loadUserProfileData(user);

    // Load travel stats from user data
    loadTravelStats(user);

    // Load reviews
    loadReviews(user);

    // Load upcoming trips
    loadUpcomingTrips(user);

    const xp = user.xp ?? 0;
    const level = 1 + Math.floor(xp / 100);
    const xpInLevel = xp % 100;
    const titleEl = document.getElementById("title-value");
    const tierEl = document.getElementById("tier-value");
    const levelEl = document.getElementById("level-value");
    const xpEl = document.getElementById("xp-value");
    const xpBarFill = document.getElementById("xpBarFill");
    
    const progress = JSON.parse(
        localStorage.getItem(
            typeof getProgressKey === "function"
                ? getProgressKey()
                : "travelAppProgress_" + user.username
        )
    ) || {};
    
    if (titleEl) titleEl.textContent = getTitleFromProgress(progress);
    if (tierEl) tierEl.textContent = getTierFromXP(xp);
    if (levelEl) levelEl.textContent = level;
    if (xpEl) xpEl.textContent = xp;
    if (xpBarFill) xpBarFill.style.width = xpInLevel + "%";

    if (banner && user.banner) {
        banner.style.backgroundImage = `url(${user.banner})`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
    }

    setupMenu();
    setupEditModals();
}

// ================= LOAD USER PROFILE DATA =================
function loadUserProfileData(user) {
    // Age
    const ageEl = document.getElementById("userAge");
    if (ageEl && user.age) {
        ageEl.textContent = `Age: ${user.age}`;
    }

    // Home City
    const cityEl = document.getElementById("homeCity");
    if (cityEl && user.homeCity) {
        cityEl.textContent = `📍 ${user.homeCity}`;
    }

    // Travel Status
    if (user.travelStatus) {
        setTravelStatusUI(user.travelStatus);
    }

    // Languages
    renderLanguages(user.languages || []);

    // Interests
    renderInterests(user.interests || []);

    // Travel Style
    renderTravelStyle(user.travelStyle || []);

    // Verification badges
    updateVerificationBadges(user);
}

// ================= LOAD TRAVEL STATS =================
function loadTravelStats(user) {
    const stats = user.travelStats || { countries: 0, cities: 0, trips: 0, distance: 0 };
    
    const countriesEl = document.getElementById("countriesVisited");
    const citiesEl = document.getElementById("citiesVisited");
    const tripsEl = document.getElementById("tripsCompleted");
    const distanceEl = document.getElementById("distanceTraveled");

    if (countriesEl) countriesEl.textContent = stats.countries;
    if (citiesEl) citiesEl.textContent = stats.cities;
    if (tripsEl) tripsEl.textContent = stats.trips;
    if (distanceEl) distanceEl.textContent = stats.distance;
}

// ================= LOAD REVIEWS =================
function loadReviews(user) {
    const reviewsList = document.getElementById("reviewsList");
    const ratingStars = document.getElementById("ratingStars");
    const ratingText = document.getElementById("ratingText");

    const reviews = user.reviews || [];
    
    if (reviews.length === 0) {
        if (ratingStars) ratingStars.textContent = "☆☆☆☆☆";
        if (ratingText) ratingText.textContent = "No reviews yet";
        if (reviewsList) reviewsList.innerHTML = "<p style='text-align:center;opacity:0.7;font-size:13px;'>No reviews yet. Complete trips to receive reviews!</p>";
    } else {
        // Calculate average rating
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        const stars = "⭐".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));
        
        if (ratingStars) ratingStars.textContent = stars;
        if (ratingText) ratingText.textContent = `${avgRating.toFixed(1)} (${reviews.length} reviews)`;

        // Render reviews
        if (reviewsList) {
            reviewsList.innerHTML = reviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <img src="${review.avatar || 'https://i.pravatar.cc/40?img=1'}" class="reviewer-avatar">
                        <div class="reviewer-info">
                            <span class="reviewer-name">${review.name}</span>
                            <span class="review-date">${review.date}</span>
                        </div>
                    </div>
                    <p class="review-text">${review.text}</p>
                </div>
            `).join("");
        }
    }
}

// ================= LOAD UPCOMING TRIPS =================
function loadUpcomingTrips(user) {
    const tripsList = document.getElementById("tripsList");
    const trips = user.upcomingTrips || [];

    if (trips.length === 0) {
        if (tripsList) tripsList.innerHTML = "<p style='text-align:center;opacity:0.7;font-size:13px;'>No upcoming trips. Add one to connect with travelers!</p>";
    } else {
        if (tripsList) {
            tripsList.innerHTML = trips.map((trip, index) => `
                <div class="trip-card">
                    <div class="trip-header">
                        <div class="trip-info">
                            <div class="trip-destination">${trip.icon || '✈️'} ${trip.destination}</div>
                            <div class="trip-dates">${trip.dates}</div>
                        </div>
                        <button class="trip-remove-btn" onclick="removeTrip(${index})" title="Remove trip">✕</button>
                    </div>
                    <div class="trip-actions">
                        <button class="btn btn-secondary btn-small" onclick="viewTrip(${index})">View Details</button>
                    </div>
                </div>
            `).join("");
        }
    }
}

// ================= EDIT FUNCTIONS =================

// Edit Age
function editAge() {
    const user = getCurrentUser();
    if (!user) return;

    openEditModal("Edit Age", user.age || "", (value) => {
        const age = parseInt(value);
        if (age > 0 && age < 150) {
            user.age = age;
            setCurrentUser(user);
            document.getElementById("userAge").textContent = `Age: ${age}`;
        } else {
            alert("Please enter a valid age!");
        }
    });
}

// Edit Home City
function editHomeCity() {
    const user = getCurrentUser();
    if (!user) return;

    openEditModal("Edit Home City", user.homeCity || "", (value) => {
        if (value.trim()) {
            user.homeCity = value.trim();
            setCurrentUser(user);
            document.getElementById("homeCity").textContent = `📍 ${value.trim()}`;
        }
    });
}

// Set Travel Status
function setTravelStatus(status) {
    const user = getCurrentUser();
    if (!user) return;

    user.travelStatus = status;
    setCurrentUser(user);
    setTravelStatusUI(status);
}

function setTravelStatusUI(status) {
    const options = document.querySelectorAll("#travelStatusSelector .status-option");
    options.forEach(opt => {
        if (opt.dataset.status === status) {
            opt.classList.add("active");
        } else {
            opt.classList.remove("active");
        }
    });
}

// Edit Bio
function editBio() {
    const user = getCurrentUser();
    if (!user) return;

    openEditModal("Edit Bio", user.bio || "", (value) => {
        user.bio = value.trim();
        setCurrentUser(user);
        document.getElementById("bioText").textContent = value.trim() || "No bio added yet.";
    });
}

// Languages
const languageOptions = [
    { code: "🇺🇸", name: "English" },
    { code: "🇪🇸", name: "Spanish" },
    { code: "🇫🇷", name: "French" },
    { code: "🇩🇪", name: "German" },
    { code: "🇮🇹", name: "Italian" },
    { code: "🇵🇹", name: "Portuguese" },
    { code: "🇷🇺", name: "Russian" },
    { code: "🇯🇵", name: "Japanese" },
    { code: "🇰🇷", name: "Korean" },
    { code: "🇨🇳", name: "Chinese" },
    { code: "🇮🇳", name: "Hindi" },
    { code: "🇦🇪", name: "Arabic" },
    { code: "🇹🇭", name: "Thai" },
    { code: "🇻🇳", name: "Vietnamese" },
    { code: "🇮🇩", name: "Indonesian" }
];

function addLanguage() {
    const user = getCurrentUser();
    if (!user) return;

    const currentLanguages = user.languages || [];
    
    const options = languageOptions
        .filter(lang => !currentLanguages.find(l => l.name === lang.name))
        .map(lang => ({ ...lang, label: `${lang.code} ${lang.name}` }));

    if (options.length === 0) {
        alert("All languages added!");
        return;
    }

    openSelectionModal("Add Language", options, (selected) => {
        user.languages = [...currentLanguages, selected];
        setCurrentUser(user);
        renderLanguages(user.languages);
    });
}

function renderLanguages(languages) {
    const container = document.getElementById("languagesList");
    if (!container) return;

    container.innerHTML = languages.map(lang => `
        <span class="language-tag" onclick="removeLanguage('${lang.name}')" title="Click to remove">${lang.code} ${lang.name}</span>
    `).join("") + '<span class="language-tag editable-tag" onclick="addLanguage()">+ Add</span>';
}

function removeLanguage(name) {
    if (!confirm(`Remove ${name}?`)) return;
    
    const user = getCurrentUser();
    if (!user) return;

    user.languages = (user.languages || []).filter(l => l.name !== name);
    setCurrentUser(user);
    renderLanguages(user.languages);
}

// Interests
const interestOptions = [
    "🎸 Music", "🏔️ Hiking", "☕ Coffee", "📸 Photography", "🍜 Food", "📚 Reading",
    "🏊 Swimming", "🧘 Yoga", "🚴 Cycling", "🎨 Art", "🏛️ History", "🌿 Nature",
    "🌅 Sunrise/Sunset", "🌙 Nightlife", "🎭 Culture", "🛍️ Shopping", "🎮 Gaming",
    "💪 Fitness", "🐱 Animals", "🌊 Beach", "⛷️ Skiing", "🧗 Climbing", "🚗 Road Trips"
];

function addInterest() {
    const user = getCurrentUser();
    if (!user) return;

    const currentInterests = user.interests || [];
    
    const options = interestOptions
        .filter(interest => !currentInterests.includes(interest))
        .map(interest => ({ code: interest.split(" ")[0], name: interest, label: interest }));

    if (options.length === 0) {
        alert("All interests added!");
        return;
    }

    openSelectionModal("Add Interest", options, (selected) => {
        user.interests = [...currentInterests, selected.label];
        setCurrentUser(user);
        renderInterests(user.interests);
    });
}

function renderInterests(interests) {
    const container = document.getElementById("interestsList");
    if (!container) return;

    container.innerHTML = interests.map(interest => `
        <span class="interest-tag" onclick="removeInterest('${interest}')" title="Click to remove">${interest}</span>
    `).join("") + '<span class="interest-tag editable-tag" onclick="addInterest()">+ Add</span>';
}

function removeInterest(interest) {
    if (!confirm(`Remove ${interest}?`)) return;
    
    const user = getCurrentUser();
    if (!user) return;

    user.interests = (user.interests || []).filter(i => i !== interest);
    setCurrentUser(user);
    renderInterests(user.interests);
}

// Travel Style
const travelStyleOptions = [
    { code: "🎒", name: "Backpacker", label: "🎒 Backpacker" },
    { code: "🏨", name: "Hotel Lover", label: "🏨 Hotel Lover" },
    { code: "🏡", name: "Airbnb", label: "🏡 Airbnb" },
    { code: "✈️", name: "Luxury", label: "✈️ Luxury" },
    { code: "⛺", name: "Camping", label: "⛺ Camping" },
    { code: "🗺️", name: "Adventure Seeker", label: "🗺️ Adventure Seeker" },
    { code: "🧘", name: "Wellness", label: "🧘 Wellness" },
    { code: "📸", name: "Photo Tourist", label: "📸 Photo Tourist" }
];

function editTravelStyle() {
    const user = getCurrentUser();
    if (!user) return;

    const currentStyles = user.travelStyle || [];
    
    const options = travelStyleOptions.map(style => {
        const isSelected = currentStyles.find(s => s.name === style.name);
        return { 
            ...style, 
            label: isSelected ? `✓ ${style.label}` : style.label,
            selected: !!isSelected
        };
    });

    openSelectionModal("Select Travel Style", options, (selected) => {
        user.travelStyle = [selected];
        setCurrentUser(user);
        renderTravelStyle(user.travelStyle);
    });
}

function renderTravelStyle(styles) {
    const container = document.getElementById("travelStyleList");
    if (!container) return;

    container.innerHTML = styles.map(style => `
        <span class="travel-style-tag" onclick="removeTravelStyle('${style.name}')" title="Click to remove">${style.label}</span>
    `).join("") + '<span class="travel-style-tag editable-tag" onclick="editTravelStyle()">+ Add Style</span>';
}

function removeTravelStyle(name) {
    if (!confirm(`Remove ${name}?`)) return;
    
    const user = getCurrentUser();
    if (!user) return;

    user.travelStyle = (user.travelStyle || []).filter(s => s.name !== name);
    setCurrentUser(user);
    renderTravelStyle(user.travelStyle);
}

// ================= VERIFICATION FUNCTIONS =================
function verifyEmail() {
    const user = getCurrentUser();
    if (!user) return;

    if (user.emailVerified) {
        alert("Email already verified!");
        return;
    }

    // Simulate email verification
    if (confirm("Verify your email address?\n\nThis is a demo - in production, this would send a verification email.")) {
        user.emailVerified = true;
        setCurrentUser(user);
        updateVerificationBadges(user);
        alert("Email verified! +50 XP");
        addXP(50);
    }
}

function verifyPhone() {
    const user = getCurrentUser();
    if (!user) return;

    if (user.phoneVerified) {
        alert("Phone already verified!");
        return;
    }

    const phone = prompt("Enter your phone number for verification:");
    if (phone) {
        // Simulate phone verification
        if (confirm(`Verify phone number: ${phone}?\n\nThis is a demo - in production, this would send an SMS code.`)) {
            user.phoneVerified = true;
            user.phone = phone;
            setCurrentUser(user);
            updateVerificationBadges(user);
            alert("Phone verified! +75 XP");
            addXP(75);
        }
    }
}

function verifyIdentity() {
    const user = getCurrentUser();
    if (!user) return;

    if (user.identityVerified) {
        alert("Identity already verified!");
        return;
    }

    // Simulate identity verification
    if (confirm("Verify your identity?\n\nThis is a demo - in production, this would require ID document upload.")) {
        user.identityVerified = true;
        setCurrentUser(user);
        updateVerificationBadges(user);
        alert("Identity verified! +100 XP");
        addXP(100);
    }
}

function updateVerificationBadges(user) {
    const emailBadge = document.getElementById("emailBadge");
    const phoneBadge = document.getElementById("phoneBadge");
    const identityBadge = document.getElementById("identityBadge");
    const verificationBadge = document.getElementById("verificationBadge");

    if (emailBadge) {
        emailBadge.className = user.emailVerified ? "trust-badge verified" : "trust-badge";
        emailBadge.textContent = user.emailVerified ? "✓ Email Verified" : "📧 Verify Email";
    }

    if (phoneBadge) {
        phoneBadge.className = user.phoneVerified ? "trust-badge verified" : "trust-badge";
        phoneBadge.textContent = user.phoneVerified ? "✓ Phone Verified" : "📱 Verify Phone";
    }

    if (identityBadge) {
        identityBadge.className = user.identityVerified ? "trust-badge verified" : "trust-badge";
        identityBadge.textContent = user.identityVerified ? "✓ Identity Verified" : "🆔 Verify Identity";
    }

    // Show main verification badge if all verified
    if (verificationBadge) {
        verificationBadge.style.display = (user.emailVerified || user.phoneVerified) ? "flex" : "none";
    }
}

// ================= TRIPS FUNCTIONS =================
function addTrip() {
    const user = getCurrentUser();
    if (!user) return;

    // Simple trip addition
    const destination = prompt("Enter destination (e.g., Manali, India):");
    if (!destination) return;

    const dates = prompt("Enter dates (e.g., Dec 20 - Dec 27):");
    if (!dates) return;

    const trips = user.upcomingTrips || [];
    trips.push({
        destination: destination,
        dates: dates,
        icon: "✈️",
        createdAt: new Date().toISOString()
    });

    user.upcomingTrips = trips;
    setCurrentUser(user);
    loadUpcomingTrips(user);
    
    alert("Trip added! +25 XP");
    addXP(25);
}

function removeTrip(index) {
    if (!confirm("Remove this trip?")) return;
    
    const user = getCurrentUser();
    if (!user) return;

    user.upcomingTrips = user.upcomingTrips || [];
    user.upcomingTrips.splice(index, 1);
    setCurrentUser(user);
    loadUpcomingTrips(user);
}

function viewTrip(index) {
    alert(`Trip details would show here!\n\nIn production, this would show full trip details and allow editing.`);
}

// ================= XP FUNCTION =================
function addXP(amount) {
    const user = getCurrentUser();
    if (!user) return;

    user.xp = (user.xp || 0) + amount;
    setCurrentUser(user);

    // Refresh the page to update XP display
    initProfile();
}

// ================= MODAL FUNCTIONS =================
let currentEditCallback = null;
let currentSelectionCallback = null;

function setupEditModals() {
    // Edit modal
    document.getElementById("editModalClose")?.addEventListener("click", closeEditModal);
    document.getElementById("editModalCancel")?.addEventListener("click", closeEditModal);
    document.getElementById("editModalSave")?.addEventListener("click", () => {
        if (currentEditCallback) {
            const input = document.getElementById("editModalInput");
            currentEditCallback(input.value);
        }
        closeEditModal();
    });

    // Selection modal
    document.getElementById("selectionModalClose")?.addEventListener("click", closeSelectionModal);
    document.getElementById("selectionModal")?.addEventListener("click", (e) => {
        if (e.target.id === "selectionModal") closeSelectionModal();
    });
}

function openEditModal(title, defaultValue, callback) {
    document.getElementById("editModalTitle").textContent = title;
    document.getElementById("editModalInput").value = defaultValue;
    document.getElementById("editModal").classList.add("show");
    currentEditCallback = callback;
    
    // Focus input
    setTimeout(() => {
        document.getElementById("editModalInput").focus();
    }, 100);
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("show");
    currentEditCallback = null;
}

function openSelectionModal(title, options, callback) {
    document.getElementById("selectionModalTitle").textContent = title;
    
    const container = document.getElementById("selectionOptions");
    
    container.innerHTML = options.map(opt => `
        <div class="selection-option" onclick="selectOption('${opt.name}', '${opt.label}')">
            <span class="selection-option-icon">${opt.code || ''}</span>
            <span class="selection-option-text">${opt.label || opt.name}</span>
            <span class="selection-option-check">✓</span>
        </div>
    `).join("");
    
    document.getElementById("selectionModal").classList.add("show");
    currentSelectionCallback = callback;
}

function selectOption(name, label) {
    if (currentSelectionCallback) {
        currentSelectionCallback({ name, label });
    }
    closeSelectionModal();
}

function closeSelectionModal() {
    document.getElementById("selectionModal").classList.remove("show");
    currentSelectionCallback = null;
}

// ================= DROPDOWN MENU =================
function setupMenu() {

    const menuBtn = document.getElementById("pfpMenuBtn");
    const menu = document.getElementById("pfpMenu");
    const closeBtn = document.getElementById("closeMenu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("show");
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            menu.classList.remove("show");
        });
    }

    menu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    document.addEventListener("click", function () {
        menu.classList.remove("show");
    });
}

// ================= PROFILE ACTIONS =================

// Generate random avatar
function generateNewAvatar() {
    const user = getCurrentUser();
    if (!user) return;

    const newAvatar =
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;

    user.pfp = newAvatar;
    setCurrentUser(user);

    const img = document.getElementById("profilePfp");
    if (img) img.src = newAvatar;
}

// Upload photo trigger
function uploadPhoto() {
    document.getElementById("photoInput")?.click();
}

// Upload banner trigger
function uploadBanner() {
    document.getElementById("bannerInput")?.click();
}

// ================= XP / TITLE / TIER / LEVEL =================
function getTitleFromProgress(progress) {

    if (progress.totalDistance >= 1000) return "World Walker";
    if (progress.totalDistance >= 300) return "Nomad";
    if (progress.locationsVisited >= 50) return "Urban Explorer";
    if (progress.locationsVisited >= 10) return "Trail Seeker";
    if (progress.unlockedAchievements?.length >= 5) return "Achiever";

    return "Wanderer";
}

function getTierFromXP(xp) {

    if (xp >= 10000) return "Legend";
    if (xp >= 5000) return "Master";
    if (xp >= 2500) return "Elite";
    if (xp >= 1000) return "Veteran";
    if (xp >= 500) return "Expert";
    if (xp >= 200) return "Pathfinder";

    return "Novice";
}

// ================= FILE INPUT HANDLERS =================
document.addEventListener("DOMContentLoaded", function () {

    initProfile();

    // Profile Photo Upload
    document.getElementById("photoInput")?.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const user = getCurrentUser();
            user.pfp = event.target.result;
            setCurrentUser(user);

            const img = document.getElementById("profilePfp");
            if (img) img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Banner Upload - show crop modal
    document.getElementById("bannerInput")?.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            openBannerCropModal(event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    });

    // Crop modal close/cancel
    document.getElementById("cropModalClose")?.addEventListener("click", closeBannerCropModal);
    document.getElementById("cropCancelBtn")?.addEventListener("click", closeBannerCropModal);
    document.getElementById("cropApplyBtn")?.addEventListener("click", applyBannerCrop);
});

// ================= BANNER CROP =================
let bannerCropper = null;

function openBannerCropModal(imageSrc) {
    const modal = document.getElementById("bannerCropModal");
    const img = document.getElementById("bannerCropImg");
    if (!modal || !img) return;

    if (bannerCropper) {
        bannerCropper.destroy();
        bannerCropper = null;
    }

    img.src = imageSrc;
    modal.classList.add("show");

    img.onload = function() {
        bannerCropper = new Cropper(img, {
            aspectRatio: 3 / 1,
            viewMode: 1,
            dragMode: "move",
            autoCropArea: 1,
            guides: true,
            center: true
        });
    };
}

function closeBannerCropModal() {
    const modal = document.getElementById("bannerCropModal");
    if (bannerCropper) {
        bannerCropper.destroy();
        bannerCropper = null;
    }
    if (modal) modal.classList.remove("show");
}

function applyBannerCrop() {
    if (!bannerCropper) return;

    const canvas = bannerCropper.getCroppedCanvas({
        width: 1200,
        height: 400,
        imageSmoothingEnabled: true
    });

    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const user = getCurrentUser();
    if (user) {
        user.banner = dataUrl;
        setCurrentUser(user);
    }

    const banner = document.getElementById("profileBanner");
    if (banner) {
        banner.style.backgroundImage = `url(${dataUrl})`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
    }

    closeBannerCropModal();
}
