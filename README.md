# 🎣 Fin Finder

**Fin Finder** is a full-stack fly fishing trip planner and journaling app. It helps anglers plan smarter fishing trips using real-time streamflow, weather data, and trip history. With built-in user authentication, data persistence, and future AI-powered insights, Fin Finder becomes your intelligent fly fishing companion.

---

## 📦 Tech Stack

- **Frontend**: React (Create React App), React Router, Bootstrap 5
- **Backend**: Express.js (ESM), Node.js
- **Database**: Supabase (PostgreSQL + Auth)
- **Authentication**: Clerk.dev
- **APIs** (Planned): USGS (streamflow), OpenWeather (weather), GNIS or other stream/river data

---

## 🚀 Features

### ✅ Core Features (Built or In Progress)
- User authentication with Clerk
- Responsive dashboard with Bootstrap
- Create and manage fishing trips
- Select river and trip date
- Auto-generate trip titles based on river + date
- Trip data saved to Supabase (title, location, date, etc.)
- Streamflow and weather fields (currently hardcoded for testing)
- View and manage saved fishing spots
- Navbar with persistent navigation and user dropdown

### 🛠️ Backend
- REST API to sync users to Supabase
- PostgreSQL schema for users, trips, fish caught, and spots
- Secure ESM-based Express server
- Trip creation with relational integrity (user → trip → spot)

---

## 📅 Planned Features (Backlog Highlights)

- ✅ Pre-trip and post-trip notes
- ✅ Trip rating system (1–5 stars)
- ✅ Weather + streamflow alerts via email
- ✅ AI assistant to suggest fishing trips based on past data
- ✅ Streamflow tracker (standalone feature)
- ✅ User favorites for rivers
- ✅ Photo uploads for fish caught
- ✅ Full weather.com forecast linking
- ✅ Paid tier and Stripe integration (future)
- ✅ Mobile support and potential mobile app via React Native

---

## 📸 Screenshots
*(Coming soon as app develops — landing page, dashboard, new trip form, etc.)*

---
