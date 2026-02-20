# InvestoMart – Project Setup Guide

A full-stack Django + React (Vite) application for goat farming investment management.

---

## 📁 Project Structure

```
investomart/
├── backend/    # Django REST API
└── frontend/   # React (Vite) app
```

---

## ⚙️ Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| MongoDB Atlas account | — |
| Cloudinary account | — |

---

## 🔧 Backend Setup (Django)

### 1. Create & activate a virtual environment

```bash
cd investomart/backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Create a `.env` file

Create `backend/.env` with the following keys:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGO_DB_NAME=goatfarm

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run migrations & start the server

```bash
python manage.py migrate
python manage.py runserver
```

> API will be available at `http://127.0.0.1:8000`

---

## 🎨 Frontend Setup (React + Vite)

### 1. Install Node dependencies

```bash
cd investomart/frontend
npm install
```

### 2. Create a `.env` file

Create `frontend/.env` with the following keys:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Start the development server

```bash
npm run dev
```

> App will be available at `http://localhost:5173`

---

## 📦 Key Dependencies

### Backend (`requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| Django | 3.1.12 | Web framework |
| djangorestframework | 3.16.1 | REST API |
| django-cors-headers | 3.1.1 | CORS handling |
| pymongo | 3.11.4 | MongoDB client |
| google-auth | 2.48.0 | Google OAuth |
| cloudinary | 1.44.1 | File/image uploads |
| python-dotenv | 1.1.0 | Environment variables |
| requests | 2.32.3 | HTTP client |

### Frontend (`package.json`)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-router-dom | ^7.11.0 | Client-side routing |
| @mui/material | ^5.18.0 | UI components |
| @mantine/core | ^8.3.12 | UI components |
| axios | ^1.13.2 | HTTP client |
| recharts | ^3.7.0 | Charts |
| tailwindcss | ^4.1.18 | CSS utility |
| jwt-decode | ^4.0.0 | JWT parsing |
| react-markdown | ^10.1.0 | Markdown rendering |
| vite | ^7.2.4 | Build tool |

---

## 🚀 Running Both Servers

Open **two terminals**:

```bash
# Terminal 1 – Backend
cd investomart/backend
venv\Scripts\activate   # or source venv/bin/activate
python manage.py runserver

# Terminal 2 – Frontend
cd investomart/frontend
npm run dev
```
