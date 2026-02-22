// ================= MAIN PAGE INIT =================
function initMainPage() {
    const xpValue = document.getElementById("xp-value");
    const pfp = document.getElementById("topPfp");
    const titleBtn = document.getElementById("title");

    // Mainpage landing - if logged in, show Go to Map instead of Login/Register
    if (!xpValue && !pfp && !titleBtn) {
        const user = getCurrentUser();
        if (user) {
            const group = document.getElementById("mainpageButtons");
            if (group) {
                group.innerHTML = '<button onclick="window.location.href=\'map.html\'" class="btn btn-primary">Go to Map</button>';
            }
        }
        return;
    }

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
            window.location.href = "profile.html";
        });
    }

    // Achievement Navigation
    if (titleBtn) {
        titleBtn.addEventListener("click", function () {
            window.location.href = "achievements.html";
        });
    }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
    initMainPage();
});