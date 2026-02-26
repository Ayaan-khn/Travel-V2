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
        window.location.href = "discover.html";
    });
}

document.addEventListener("DOMContentLoaded", initLogin);
