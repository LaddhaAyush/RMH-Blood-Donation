"# 🩸 RMH Blood Donation Drive

A modern, responsive web application for managing blood donation registration events. Built with Node.js, Express, and MongoDB.

![Blood Donation Dashboard](https://img.shields.io/badge/Status-Active-success)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

## ✨ Features

- **Donor Registration Form** - Easy-to-use form for collecting donor information
- **Real-time Dashboard** - Live statistics showing total donors and lives saved
- **Thank You Popup** - Beautiful 10-second popup displayed on dashboard when new donor registers
- **Recent Heroes Section** - Display of recent donors
- **Animated UI** - Smooth animations, floating hearts, and heartbeat effects
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Auto-refresh Stats** - Dashboard updates every 5 seconds

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Custom CSS with CSS Variables

## 📁 Project Structure

```
blood-donation-project/
├── public/
│   ├── index.html        # Registration form page
│   ├── dashboard.html    # Live statistics dashboard
│   ├── style.css         # All styles
│   └── script.js         # Frontend JavaScript
├── server/
│   ├── server.js         # Express server & API routes
│   └── models/
│       ├── Donor.js      # Donor schema
│       └── Stats.js      # Stats schema
├── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LaddhaAyush/RMH-Blood-Donation.git
   cd RMH-Blood-Donation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Registration: http://localhost:3000/
   - Dashboard: http://localhost:3000/dashboard

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/donate` | Register a new donor |
| GET | `/api/stats` | Get total blood units collected |
| GET | `/api/donors` | Get list of recent donors |
| POST | `/api/sync-stats` | Sync stats with actual donor count |

## 🎨 Screenshots

### Registration Page
- Clean form with blood group selection
- Age and academic year validation
- Beautiful red-themed design

### Dashboard
- Real-time donor count
- Lives saved calculator (3x donors)
- Rotating awareness slogans
- Recent heroes list

### Thank You Popup
- Appears for 10 seconds after registration
- Shows donor name and blood group
- Floating hearts animation

## ⚙️ Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blood_donation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Ayush Laddha**
- GitHub: [@LaddhaAyush](https://github.com/LaddhaAyush)

---

*"A single drop of blood can make a huge difference"* ❤️" 
