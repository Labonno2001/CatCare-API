# 🐾 CatCare — A Little Wellness Corner for Mini 💜

Hello, cat lovers! 🐱✨

Welcome to **CatCare**, a small project made with love to keep track of a cat's everyday care.

This project started with a simple idea: looking after a furry friend means paying attention to the little things — meals, water, and daily routines. So, I built a little digital home for Mini where her profile and wellness records can live together. 🏡🐾

It is a beginner-friendly project built while learning JavaScript, Express, APIs, and SQLite. It is simple, practical, and still growing — just like the person learning to build it! 💜

## 🌷 What Can CatCare Do?

🐱 **Mini's Profile**
- View Mini's profile and favorite food.
- Edit her name, age, weight, favorite food, and activity.

🍽️ **Feeding Tracker**
- Record food names, quantities, meal times, and notes.
- View feeding history and total food recorded.
- Edit or delete feeding records.

💧 **Water Tracker**
- Record water offered and measured consumption.
- View water history and totals.
- Edit or delete water records.

📅 **Daily Wellness Report**
- Choose a date to see feeding and water summaries for that day.

🗄️ **SQLite Database**
- Store records locally so they remain available after the server restarts.

🌐 **Simple Web Dashboard**
- A friendly interface built with HTML, CSS, and JavaScript.
- An Express backend connects the webpage to the database.

## 🧸 Built With

- **JavaScript** — the logic behind the project
- **Node.js** — runs JavaScript on the server
- **Express.js** — handles API requests and serves the webpage
- **SQLite** — stores Mini's profile and care records
- **HTML & CSS** — create the webpage
- **Git & GitHub** — keep track of the code and its progress

## 🚀 How to Run CatCare

Want to try this little project on your own computer? Follow these steps!

### 1. Get the project

```bash
git clone https://github.com/Labonno2001/CatCare-API.git
cd CatCare-API
```

### 2. Install the dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm run dev
```

### 4. Open the dashboard

Visit this address in your browser:

**http://localhost:3000**

And hello, CatCare! 🐾

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check whether the API is running |
| GET | `/api/cat` | View Mini's profile |
| PATCH | `/api/cat` | Edit Mini's profile |
| GET | `/api/feeding` | View feeding records |
| POST | `/api/feeding` | Add a feeding record |
| PATCH | `/api/feeding/:id` | Edit a feeding record |
| DELETE | `/api/feeding/:id` | Delete a feeding record |
| GET | `/api/feeding/summary` | View feeding totals |
| GET | `/api/water` | View water records |
| POST | `/api/water` | Add a water record |
| PATCH | `/api/water/:id` | Edit a water record |
| DELETE | `/api/water/:id` | Delete a water record |
| GET | `/api/water/summary` | View water totals |
| GET | `/api/wellness/daily?date=YYYY-MM-DD` | View a daily report |

## 📁 Project Structure

```text
CatCare-API/
├── public/
│   └── index.html
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 💜 A Little Note

CatCare is a learning project, not a veterinary medical system. Its summaries help organize recorded information; they do not diagnose health problems or replace advice from a veterinarian.

The database is stored locally on the computer running the app. The project does not automatically synchronize Mini's records between devices.

Please keep private data and secrets out of public repositories. 🐾

## 🌈 What's Special About This Project?

For me, this is more than a collection of code. It is a small step toward becoming better at building real applications — learning by doing, fixing mistakes, and making something useful along the way.

Every big project begins with a little idea. This one begins with a cat. 🐈💗

Thanks for visiting Mini's little corner of the internet!

**Made with curiosity, code, and lots of cat love.** 💜🐾
