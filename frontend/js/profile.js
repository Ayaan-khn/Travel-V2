// ================= STORAGE UTIL =================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

// ================= AUTH CHECK =================
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "Login.html";
        return null;
    }
    return user;
}

// ================= PROFILE INIT =================
function initProfile() {

    const user = requireAuth();
    if (!user) return;

    const usernameEl = document.getElementById("username");
    const bioEl = document.getElementById("bioText");
    const profilePfp = document.getElementById("profilePfp");
    const banner = document.getElementById("profileBanner");

    if (usernameEl) usernameEl.textContent = user.username;
    if (bioEl) bioEl.textContent = user.bio || "No bio added.";
    if (profilePfp) profilePfp.src = user.pfp || "";

    if (banner && user.banner) {
        banner.style.backgroundImage = `url(${user.banner})`;
        banner.style.backgroundSize = "cover";
        banner.style.backgroundPosition = "center";
    }

    setupMenu();
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

// Edit bio
function editBio() {
    const user = getCurrentUser();
    if (!user) return;

    const newBio = prompt("Enter your bio:", user.bio || "");

    if (newBio !== null) {
        user.bio = newBio;
        setCurrentUser(user);

        const bio = document.getElementById("bioText");
        if (bio) bio.textContent = newBio;
    }
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

    // Banner Upload
    document.getElementById("bannerInput")?.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const user = getCurrentUser();
            user.banner = event.target.result;
            setCurrentUser(user);

            const banner = document.getElementById("profileBanner");
            if (banner) {
                banner.style.backgroundImage = `url(${event.target.result})`;
                banner.style.backgroundSize = "cover";
            }
        };
        reader.readAsDataURL(file);
    });
});