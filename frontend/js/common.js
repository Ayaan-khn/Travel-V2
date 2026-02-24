// ================= SHARED STORAGE & AUTH =================

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    syncUserToStorage(user);
}

// Sync user to users array (so pfp, banner, bio, xp persist on re-login)
function syncUserToStorage(user) {
    if (!user || !user.email) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
        saveUsers(users);
    }
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem("loggedInUser");
    // send back to main page after logout
    window.location.href = "mainpage.html";
}
