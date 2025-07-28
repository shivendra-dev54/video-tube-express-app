# 🎬 YouTube Clone Backend (Node.js + Express + MongoDB)

This is a backend project for a basic YouTube clone built using **Express**, **MongoDB**, and **Mongoose**. This project is based on the tutorial by Hitesh Choudhary on Udemy.

---

## 📁 Tech Stack

- Node.js
    – Runtime environment
- Express.js
    – Web framework for Node.js
- MongoDB
    – NoSQL database
- Mongoose
    – MongoDB ODM (Object Data Modeling)
- dotenv
    – For environment variable management
- nodemon
    – For auto-restarting during development

---

## 🚀 Getting Started

### 1. Clone the Repository

`git clone https://github.com/shivendra-dev54/video-tube-express-app.git && cd video-tube-express-app `

### 2. Install Dependencies

`npm install `

### 3. Set up Environment Variables

Create a `.env` file in the root directory and add: 

`PORT=64000`
`CORS_ORIGIN=*`
`MONGODB_URI=mongodb://localhost:27017/youtube-clone JWT_SECRET=your_secret_key` 
> You can change these values as per your setup.

### 4. Start the Server 
For development (with `nodemon`): `npm run dev ` 
Or for normal run: `npm start `

---

## 📦 Available Scripts

`npm run dev # Start server with nodemon npm start # Start server normally `

---

## 📌 Features (Planned / WIP)

- [x] User registration & login (JWT-based)
- [ ] Video listing & watch
- [ ] Like, comment, and subscribe system
- [ ] Profile & channel management

---

## 📬 API Endpoints

> Not finalized yet. Will update as features are added.

---

## 🧑‍💻 Author 
Shivendra Bhaginath Devadhe

Learning full-stack backend development Project inspired by Hitesh Choudhary’s Udemy course.

---

## 📄 License

This project is for learning purposes only.
