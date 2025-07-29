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

### Health Check:

**1. GET http://localhost:64000/api/v1/healthcheck/**<br>
    This is the endpoint to check if the server is working or not.<br>
    No body is required for this endpoint.

---
---

### User routes: 

**2. POST http://localhost:64000/api/v1/user/register/**
    This is the endpoint for registering a new user.
    
    
    body: {
        fullName: String,
        username: String,
        email: String,
        password: String,
        avatar: imageFile,
        coverImage: imageFile
    }
    
---

**3. POST http://localhost:64000/api/v1/user/login/**<br>
    This is the endpoint for logging in a user and sent the refresh token to the cookies.
    
    
    body: {
        email: String,
        password: String
    }
    
---

**4. POST http://localhost:64000/api/v1/user/refresh-token/**<br>
    This is the endpoint for refreshing the access and refresh tokens.
    
    
    body: {
        refreshToken: String // can be present in the Authorization headers (Bearer ~token~) as well
    }
    
---

**5. POST http://localhost:64000/api/v1/user/logout/**<br>
    This is the endpoint for logging out from the account(to delete tokens).
    
---

**6. POST http://localhost:64000/api/v1/user/change-password/**<br>
    This is the endpoint for changing the current password of the user.
    
    
    body: {
        currentPassword: String,
        newPassword: String
    }

--- 

**7. GET http://localhost:64000/api/v1/user/current/**<br>
    This is the endpoint for getting the current user details.<br>
    It requires the user to be logged in.<br>
    It returns the user details in the response.<br>
    No body is required for this endpoint.

--- 

**8. PUT http://localhost:64000/api/v1/user/update-account-details/**<br>
    This is the endpoint for updating the account details of the user.
    
    
    body: {
        fullName: String,
        username: String,
        email: String
    }

---

**9. PUT http://localhost:64000/api/v1/user/update-avatar/**<br>
    This is the endpoint for updating the avatar of the user.
    
    
    body: {
        avatar: imageFile
    }

---

**10. PUT http://localhost:64000/api/v1/user/update-cover-image/**<br>
    This is the endpoint for updating the cover image of the user.
    
    
    body: {
        coverImage: imageFile
    }


---
---

## 🧑‍💻 Author 
> Shivendra Bhaginath Devadhe

Learning full-stack backend development Project inspired by Hitesh Choudhary’s Udemy course.

---

## 📄 License

This project is for learning purposes only.
