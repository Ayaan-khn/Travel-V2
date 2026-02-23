
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
    if (profilePfp) profilePfp.src = user.pfp || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;

    const xp = user.xp ?? 0;
    const level = 1 + Math.floor(xp / 100);
    const xpInLevel = xp % 100;
    const titleEl = document.getElementById("title-value");
    const tierEl = document.getElementById("tier-value");
    const levelEl = document.getElementById("level-value");
    const xpEl = document.getElementById("xp-value");
    const xpBarFill = document.getElementById("xpBarFill");
   const progress = JSON.parse(
    localStorage.getItem(getProgressKey())
) || {};
titleEl.textContent = getTitleFromProgress(progress);
tierEl.textContent = getTierFromXP(xp);
    if (levelEl) levelEl.textContent = level;
    if (xpEl) xpEl.textContent = xp;
    if (xpBarFill) xpBarFill.style.width = xpInLevel + "%";

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

// ================= XP / TITLE / TIER / LEVEL =================
function getTitleFromProgress(progress) {

    if (progress.totalDistance >= 1000) return "🌍 World Walker";
    if (progress.totalDistance >= 300) return "🧭 Nomad";
    if (progress.locationsVisited >= 50) return "🏙️ Urban Explorer";
    if (progress.locationsVisited >= 10) return "🗺️ Trail Seeker";
    if (progress.unlockedAchievements?.length >= 5) return "🏅 Achiever";

    return "🚶 Wanderer";
}
function getTierFromXP(xp) {

    if (xp >= 10000) return "🌌 Legend";
    if (xp >= 5000) return "💎 Master";
    if (xp >= 2500) return "🔥 Elite";
    if (xp >= 1000) return "⚔️ Veteran";
    if (xp >= 500) return "🛡️ Expert";
    if (xp >= 200) return "🏹 Pathfinder";
    return "🌱 Novice";
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