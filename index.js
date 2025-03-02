const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Could not connect to MongoDB", err));

// Destination Schema
const destinationSchema = new mongoose.Schema({
    answers: [String],
    city: String,
    country: String,
    clues: [String],
    fun_fact: [String],
    trivia: [String],
});

const Destination = mongoose.model("Destination", destinationSchema);

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// GET /api/destination - Fetch a random destination
app.get("/api/destination", async (req, res) => {
    try {
        const count = await Destination.countDocuments();
        const random = Math.floor(Math.random() * count);
        const destination = await Destination.findOne().skip(random);

        if (!destination) {
            return res.status(404).json({ error: "No destinations found" });
        }

        // Shuffle the answers array
        destination.answers = shuffleArray(destination.answers);

        // Generate a JWT token containing the destinationId
        const token = jwt.sign({ destinationId: destination._id }, "secret", {
            expiresIn: "1h",
        });

        // Return the destination and token
        res.json({ destination, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    score: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

// POST /api/guess - Validate user's guess
app.post("/api/guess", async (req, res) => {
    const { userGuess, token, username } = req.body;

    if (!token || !userGuess || !username) {
        return res
            .status(400)
            .json({ error: "Token, userGuess, and username are required" });
    }

    try {
        // Decode the JWT to get the destinationId
        const decoded = jwt.verify(token, "secret");
        const destinationId = decoded.destinationId;

        // Find the destination by ID
        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return res.status(404).json({ error: "Destination not found" });
        }

        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Validate the user's guess
        if (destination.city.toLowerCase() === userGuess.toLowerCase()) {
            user.score += 1; // Increment score for correct guess
            await user.save();
            res.json({
                correct: true,
                funFact: destination.fun_fact[0],
                trivia: destination.trivia[0],
                score: user.score,
            });
        } else {
            res.json({
                correct: false,
                funFact: destination.fun_fact[0],
                trivia: destination.trivia[0],
                score: user.score,
            });
        }
    } catch (error) {
        console.error(error);

        // Handle JWT errors (e.g., expired token)
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/register - Register a new user
app.post("/api/register", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Create a new user
        const newUser = new User({ username });
        await newUser.save();

        res.json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Challenge: Add a GET /api/login route
app.get("/api/challenge/:username", async (req, res) => {
    const { username } = req.params;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate a shareable link
        const shareLink = `https://${req.headers.host}/challenge?username=${username}&score=${user.score}`;

        res.json({ shareLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start server
const PORT = process.env.PORT || 5000; // Use Railway's PORT or fallback to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
