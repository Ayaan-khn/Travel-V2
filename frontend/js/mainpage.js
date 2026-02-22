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

// ================= MAIN PAGE INIT =================
function initMainPage() {
    const xpValue = document.getElementById("xp-value");
    const pfp = document.getElementById("topPfp");
    const titleBtn = document.getElementById("title");

    const user = requireAuth();
    if (!user) return;

    // XP Display
    if (xpValue) {
        xpValue.textContent = user.xp ?? 0;
    }

    // Profile Picture
    if (pfp) {
        if (user.pfp) {
            pfp.src = user.pfp;
        } else {
            const randomAvatar =
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}`;

            pfp.src = randomAvatar;
            user.pfp = randomAvatar;
            setCurrentUser(user);
        }

        pfp.addEventListener("click", function () {
            window.location.href = "Profile.html";
        });
    }

    // Achievement Navigation
    if (titleBtn) {
        titleBtn.addEventListener("click", function () {
            window.location.href = "Achievement.html";
        });
    }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
    initMainPage();
});