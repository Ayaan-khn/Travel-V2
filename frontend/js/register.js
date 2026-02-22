// ================= REGISTER =================
function initRegister() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value.trim();

        if (username.length < 3) {
            alert("Username must be at least 3 characters.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const users = getUsers();

        if (users.find(user => user.email === email)) {
            alert("User already exists.");
            return;
        }

        const newUser = {
            username,
            email,
            password,
            xp: 0,
            bio: "",
            pfp: "",
            banner: ""
        };

        users.push(newUser);
        saveUsers(users);

        alert("Account created successfully.");
        window.location.href = "login.html";
    });
}

document.addEventListener("DOMContentLoaded", initRegister);
