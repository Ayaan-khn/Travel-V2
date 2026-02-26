// ================= SHARED STORAGE & AUTH =================

// API Base URL
const API_BASE = "http://localhost:8001/api";

// Store token
let authToken = localStorage.getItem("authToken") || null;

// ================= API FUNCTIONS =================

async function apiRequest(endpoint, method = "GET", data = null) {
    const headers = {
        "Content-Type": "application/json",
    };
    
    if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
    }
    
    const options = {
        method,
        headers,
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || "Request failed");
    }
    
    return response.json();
}

// ================= AUTH FUNCTIONS =================

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    // First try to get from API cache
    const cachedUser = localStorage.getItem("cachedUser");
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem("loggedInUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    localStorage.setItem("cachedUser", JSON.stringify(user));
}

function setAuthToken(token) {
    authToken = token;
    localStorage.setItem("authToken", token);
}

function getAuthToken() {
    return authToken;
}

// Sync user to storage
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

// Login with backend API
async function loginAPI(email, password) {
    try {
        const response = await apiRequest("/login", "POST", { email, password });
        
        if (response.token) {
            setAuthToken(response.token);
            setCurrentUser(response.user);
            return { success: true, user: response.user };
        }
    } catch (error) {
        // Fallback to localStorage if API is not running
        console.log("API not available, using localStorage");
        return loginLocal(email, password);
    }
}

// Register with backend API
async function registerAPI(email, username, password, name) {
    try {
        const response = await apiRequest("/register", "POST", { 
            email, 
            username, 
            password, 
            name 
        });
        
        if (response.token) {
            setAuthToken(response.token);
            setCurrentUser({
                id: response.user_id,
                email,
                username,
                name
            });
            return { success: true };
        }
    } catch (error) {
        // Fallback to localStorage if API is not running
        console.log("API not available, using localStorage");
        return registerLocal(email, username, password, name);
    }
}

// Logout
function logout() {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("cachedUser");
    localStorage.removeItem("authToken");
    authToken = null;
    window.location.href = "mainpage.html";
}

// ================= LOCAL FALLBACK FUNCTIONS =================

// Local login fallback
function loginLocal(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        setCurrentUser(user);
        return { success: true, user };
    }
    
    throw new Error("Invalid credentials");
}

// Local register fallback
function registerLocal(email, username, password, name) {
    const users = getUsers();
    
    if (users.find(u => u.email === email || u.username === username)) {
        throw new Error("User already exists");
    }
    
    const newUser = {
        id: Date.now(),
        email,
        username,
        password,
        name: name || username,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    
    return { success: true };
}

// ================= PROFILE API FUNCTIONS =================

async function updateProfileAPI(data) {
    return await apiRequest("/users/me", "PUT", data);
}

async function getExperiencesAPI(category = null) {
    const endpoint = category ? `/experiences?category=${category}` : "/experiences";
    return await apiRequest(endpoint);
}

async function createExperienceAPI(data) {
    return await apiRequest("/experiences", "POST", data);
}

async function getPlansAPI(planType = "public") {
    return await apiRequest(`/plans?plan_type=${planType}`);
}

async function createPlanAPI(data) {
    return await apiRequest("/plans", "POST", data);
}

// ================= CONVERSATIONS =================

function getConversations() {
    return JSON.parse(localStorage.getItem("conversations")) || [];
}

function saveConversations(conversations) {
    localStorage.setItem("conversations", JSON.stringify(conversations));
}
