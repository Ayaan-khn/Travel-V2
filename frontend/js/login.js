// ================= STORAGE UTIL =================
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

// ================= LOGIN =================
function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const users = getUsers();

        const validUser = users.find(
            user => user.email === email && user.password === password
        );

        if (!validUser) {
            alert("Invalid credentials.");
            return;
        }

        setCurrentUser(validUser);

        // Redirect after successful login
        window.location.href = "Map.html";
    });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", function () {
    initLogin();
});