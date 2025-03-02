# Globetrotter Challenge

🌍 The Globetrotter Challenge is a full-stack web app where users guess famous destinations based on cryptic clues. After guessing, users unlock fun facts, trivia, and surprises about the destination!

## Features

-   **Cryptic Clues**: Get 1–2 random clues about a destination.
-   **Multiple-Choice Answers**: Guess the correct destination from 3 options.
-   **Feedback**: Immediate feedback with animations (confetti for correct, sad face for incorrect).
-   **Fun Facts & Trivia**: Learn interesting facts about each destination.
-   **Score Tracking**: Track your correct and incorrect answers.
-   **Challenge a Friend**: Share a link with friends to challenge them.

## Tech Stack

-   **Frontend**: HTML, CSS, JavaScript
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **Authentication**: JWT (JSON Web Tokens)
-   **Hosting**: Railway (Backend), Vercel (Frontend)
-   **AI Integration**: OpenAI API (for dataset generation)

## Setup Instructions

### Prerequisites

-   Node.js (v16 or higher)
-   MongoDB (local or cloud instance)

### 1. Clone the Repository

git clone https://github.com/pjyn/Globetrotter-Challenge-App.git
cd Globetrotter-Challenge-App

### 2. Install Dependencies

npm install

### 3. Set Up Environment Variables

MONGODB_URI=mongodb://localhost:27017/globetrotter
JWT_SECRET=your-secret-key

### 4. Start the Backend Server

nodemon index.js

### 5. Set Up Frontend

The frontend files are located in the public folder.
Open index.html in your browser to play the game.

### 6. API Endpoint

1. GET /api/destination: Fetch a random destination with clues and answers.

2. POST /api/guess: Validate the user’s guess and return feedback.

3. POST /api/register: Register a new user.

4. GET /api/challenge/:username: Generate a shareable link for challenging a friend.
