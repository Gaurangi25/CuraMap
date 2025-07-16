# CuraMap 🏥🗺️

**CuraMap** is your go-to full-stack app for finding hospitals and healthcare facilities with live updates on essential resources like beds, oxygen, and ambulances — all mapped out for easy access!

---

## 🚀 Features

- 🔍 **Search & Filter Hospitals** by name, location, and available resources  
- 🗺️ **Interactive Google Maps** with clickable hospital markers  
- 🏥 **Hospital Entry Management** — Add, update, or delete your hospital info securely  
- 🔐 **User Authentication** with email/password & Google OAuth using JWT  
- 📊 **Live Resource Availability** for beds, oxygen, ambulances *(currently using dummy data)*  
- 🛡️ **Protected Routes** to keep hospital data safe and accurate  
- ⚙️ **Robust Backend API** with Express.js & MongoDB Atlas  

---

## 🛠️ Tech Stack

- **Frontend:** React.js + React Router + CSS  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB Atlas with Mongoose  
- **Authentication:** JWT + Passport.js (Google OAuth)  
- **Maps:** Google Maps JavaScript API

---

## 💡 How It Works

1. Find hospitals near you or by name, with real-time data on resource availability.  
2. View hospitals on the map, click markers for detailed info.  
3. Hospital admins can securely log in to manage their hospital details.  
4. Data syncs dynamically via a secure backend API using JWT tokens.  

---

## 🔄 Current Status

- Core features (auth, CRUD for hospitals, map integration) ✅  
- Resource availability data (beds, oxygen, ambulances) currently uses **dummy data** for demo purposes  
- Fetching real hospital data with Google Places API — *in progress* 🔧  
- UI improvements and deployment setup ongoing 🚧  

---

## 🌟 Future Plans

- Push notifications for urgent updates 🚨  
- Advanced analytics dashboard 📈  
- Accessibility improvements ♿  
- Performance and scalability enhancements 🚀  

---

## 🚀 How to Run CuraMap Locally

1. **Clone the repo**  
   ```bash
   git clone (https://github.com/Gaurangi25/CuraMap.git)
   cd curamap

2. **Install dependencies**
    **For backend:**
      cd server
      npm install

   **For frontend:**
      cd ../client
      npm install

3. Set up environment variables
 Create a .env file in the server folder with:
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret_key
- GOOGLE_CLIENT_ID=your_google_oauth_client_id
- GOOGLE_CLIENT_SECRET=your_google_client_secret
- CLIENT_URL=http://localhost:3000

 Create a .env.local file in the client folder with:
- REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
- REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
- REACT_APP_API_BASE_URL=http://localhost:5000

4. **Start the backend server**
      cd ../server
      npm start

5. **Start the frontend app**
      cd ../client
      npm start

6. **Open in browser**
    Go to http://localhost:3000 to use CuraMap! 🎉
