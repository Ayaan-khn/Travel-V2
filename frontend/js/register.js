// ================= REGISTER =================
async function initRegister() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value.trim();
        const name = username; // Use username as name

        if (username.length < 3) {
            alert("Username must be at least 3 characters.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Creating account...";
        submitBtn.disabled = true;

        try {
            // Try API register first
            const result = await registerAPI(email, username, password, name);
            
            if (result.success) {
                window.location.href = "discover.html";
            }
        } catch (error) {
            // Fallback to localStorage
            try {
                const result = registerLocal(email, username, password, name);
                if (result.success) {
                    window.location.href = "discover.html";
                }
            } catch (err) {
                alert(err.message || "Registration failed. Please try again.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", initRegister);
