// ================= LOGIN =================
async function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Logging in...";
        submitBtn.disabled = true;

        try {
            // Try API login first
            const result = await loginAPI(email, password);
            
            if (result.success) {
                window.location.href = "discover.html";
            }
        } catch (error) {
            // Fallback to localStorage
            try {
                const result = loginLocal(email, password);
                if (result.success) {
                    window.location.href = "discover.html";
                }
            } catch (err) {
                alert("Invalid credentials.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", initLogin);
