"""
TravelSync Backend API
Real backend with SQLite database for user authentication and data storage
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import sqlite3
import hashlib
import secrets
import os

app = FastAPI(title="TravelSync API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Database setup
DB_PATH = "travelsync.db"

def init_db():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        age INTEGER,
        bio TEXT,
        city TEXT,
        photo_url TEXT,
        banner_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Experiences table
    c.execute('''CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        date_time TEXT,
        category TEXT,
        max_participants INTEGER DEFAULT 10,
        participants_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Plans table
    c.execute('''CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        destination TEXT NOT NULL,
        dates TEXT,
        purpose TEXT,
        description TEXT,
        open_to_join INTEGER DEFAULT 1,
        spots INTEGER DEFAULT 5,
        total_spots INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )''')
    
    # Messages table
    c.execute('''CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    )''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

# Initialize database on startup
init_db()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    name: Optional[str]
    age: Optional[int]
    bio: Optional[str]
    city: Optional[str]
    photo_url: Optional[str]
    banner_url: Optional[str]

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    city: Optional[str] = None

class ExperienceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    date_time: Optional[str] = None
    category: Optional[str] = None
    max_participants: int = 10

class PlanCreate(BaseModel):
    destination: str
    dates: Optional[str] = None
    purpose: Optional[str] = None
    description: Optional[str] = None
    open_to_join: bool = True
    total_spots: int = 5

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def create_token() -> str:
    return secrets.token_urlsafe(32)

# Store active tokens (in production, use Redis)
active_tokens = {}

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ==================== AUTH ENDPOINTS ====================

@app.post("/api/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    conn = get_db()
    c = conn.cursor()
    
    # Check if user exists
    c.execute("SELECT id FROM users WHERE email = ? OR username = ?", 
              (user.email, user.username))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    password_hash = hash_password(user.password)
    c.execute('''INSERT INTO users (email, username, password_hash, name) 
                 VALUES (?, ?, ?, ?)''',
              (user.email, user.username, password_hash, user.name))
    
    user_id = c.lastrowid
    conn.commit()
    conn.close()
    
    # Create token
    token = create_token()
    active_tokens[token] = user_id
    
    return {
        "message": "User created successfully",
        "token": token,
        "user_id": user_id,
        "username": user.username
    }

@app.post("/api/login")
def login(credentials: UserLogin):
    conn = get_db()
    c = conn.cursor()
    
    c.execute("SELECT * FROM users WHERE email = ?", (credentials.email,))
    user = c.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_token()
    active_tokens[token] = user["id"]
    
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "name": user["name"],
            "city": user["city"]
        }
    }

@app.post("/api/logout")
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    if token in active_tokens:
        del active_tokens[token]
    return {"message": "Logged out successfully"}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = active_tokens.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = c.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return dict(user)

# ==================== USER ENDPOINTS ====================

@app.get("/api/users/me")
def get_current_user_info(current_user = Depends(get_current_user)):
    return UserResponse(**current_user)

@app.put("/api/users/me")
def update_userProfile(user_update: UserUpdate, current_user = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    
    updates = []
    values = []
    
    if user_update.name is not None:
        updates.append("name = ?")
        values.append(user_update.name)
    if user_update.age is not None:
        updates.append("age = ?")
        values.append(user_update.age)
    if user_update.bio is not None:
        updates.append("bio = ?")
        values.append(user_update.bio)
    if user_update.city is not None:
        updates.append("city = ?")
        values.append(user_update.city)
    
    if updates:
        updates.append("updated_at = CURRENT_TIMESTAMP")
        values.append(current_user["id"])
        c.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()
    
    # Get updated user
    c.execute("SELECT * FROM users WHERE id = ?", (current_user["id"],))
    user = c.fetchone()
    conn.close()
    
    return {"message": "Profile updated", "user": dict(user)}

# ==================== EXPERIENCES ENDPOINTS ====================

@app.get("/api/experiences")
def get_experiences(category: Optional[str] = None):
    conn = get_db()
    c = conn.cursor()
    
    if category:
        c.execute('''SELECT e.*, u.username, u.name as creator_name, u.photo_url 
                    FROM experiences e 
                    JOIN users u ON e.user_id = u.id 
                    WHERE category = ?
                    ORDER BY e.created_at DESC''', (category,))
    else:
        c.execute('''SELECT e.*, u.username, u.name as creator_name, u.photo_url 
                    FROM experiences e 
                    JOIN users u ON e.user_id = u.id 
                    ORDER BY e.created_at DESC''')
    
    experiences = c.fetchall()
    conn.close()
    
    return [{"id": e["id"], **dict(e)} for e in experiences]

@app.post("/api/experiences")
def create_experience(exp: ExperienceCreate, current_user = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''INSERT INTO experiences (user_id, title, description, location, date_time, category, max_participants)
                 VALUES (?, ?, ?, ?, ?, ?, ?)''',
              (current_user["id"], exp.title, exp.description, exp.location, 
               exp.date_time, exp.category, exp.max_participants))
    
    exp_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {"message": "Experience created", "id": exp_id}

# ==================== PLANS ENDPOINTS ====================

@app.get("/api/plans")
def get_plans(plan_type: str = "public"):
    conn = get_db()
    c = conn.cursor()
    
    if plan_type == "my":
        # This would need user_id - placeholder for now
        c.execute('''SELECT p.*, u.username, u.name as creator_name, u.photo_url 
                    FROM plans p 
                    JOIN users u ON p.user_id = u.id 
                    ORDER BY p.created_at DESC''')
    elif plan_type == "public":
        c.execute('''SELECT p.*, u.username, u.name as creator_name, u.photo_url 
                    FROM plans p 
                    JOIN users u ON p.user_id = u.id 
                    WHERE p.open_to_join = 1
                    ORDER BY p.created_at DESC''')
    else:
        c.execute('''SELECT p.*, u.username, u.name as creator_name, u.photo_url 
                    FROM plans p 
                    JOIN users u ON p.user_id = u.id 
                    ORDER BY p.created_at DESC''')
    
    plans = c.fetchall()
    conn.close()
    
    return [{"id": p["id"], **dict(p)} for p in plans]

@app.post("/api/plans")
def create_plan(plan: PlanCreate, current_user = Depends(get_current_user)):
    conn = get_db()
    c = conn.cursor()
    
    c.execute('''INSERT INTO plans (user_id, destination, dates, purpose, description, open_to_join, spots, total_spots)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
              (current_user["id"], plan.destination, plan.dates, plan.purpose, 
               plan.description, 1 if plan.open_to_join else 0, plan.total_spots, plan.total_spots))
    
    plan_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {"message": "Plan created", "id": plan_id}

# ==================== HEALTH CHECK ====================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "TravelSync API is running!",
        "database": "SQLite connected",
        "version": "1.0.0"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to TravelSync API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting TravelSync Backend...")
    print("📍 API available at: http://localhost:8000")
    print("📚 API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
