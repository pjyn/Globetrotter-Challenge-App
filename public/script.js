let currentDestination;
let currentToken;
let score = 0;
let currentUser;

// Fetch a new destination
async function fetchDestination() {
    try {
        // Clear previous feedback
        document.getElementById("result").innerText = ""; // Clear result message
        document.getElementById("funFact").innerText = ""; // Clear fun fact
        document.getElementById("trivia").innerText = ""; // Clear trivia
        document.getElementById("sadFace").style.display = "none"; // Hide sad emoji

        // Fetch new destination and token
        const response = await fetch("/api/destination");
        const data = await response.json();
        currentDestination = data.destination;
        currentToken = data.token;

        // Display the clue
        document.getElementById("clue").innerText = currentDestination.clues[0];

        // Display the multiple-choice answers as buttons
        const answersContainer = document.getElementById("answers");
        answersContainer.innerHTML = ""; // Clear previous answers

        currentDestination.answers.forEach(answer => {
            const button = document.createElement("button");
            button.innerText = answer;
            button.addEventListener("click", () => handleGuess(answer));
            answersContainer.appendChild(button);
        });
    } catch (error) {
        console.error("Error fetching destination:", error);
        alert("Failed to fetch destination. Please try again.");
    }
}

// Handle guess submission
async function handleGuess(userGuess) {
    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userGuess, 
          token: currentToken, 
          username: currentUser.username 
        })
      });
  
      const result = await response.json();
  
      if (result.correct) {
        document.getElementById('result').innerText = 'Correct! 🎉';
        score++; // Increment score for correct guess
        confetti(); // Trigger confetti animation
      } else {
        document.getElementById('result').innerText = 'Incorrect! 😢';
        document.getElementById('sadFace').style.display = 'block'; // Show sad face
      }
  
      // Update the score display
      document.getElementById('score').innerText = `Score: ${score}`;
  
      // Display fun fact and trivia
      document.getElementById('funFact').innerText = `Fun Fact: ${result.funFact}`;
      document.getElementById('trivia').innerText = `Trivia: ${result.trivia}`;
  
      // Fetch a new destination after a short delay
      setTimeout(fetchDestination, 3000);
    } catch (error) {
      console.error('Error submitting guess:', error);
      alert('Failed to submit guess. Please try again.');
    }
  }

// Register a new user
document
    .getElementById("registerButton")
    .addEventListener("click", async () => {
        const username = document.getElementById("usernameInput").value;

        if (!username) {
            alert("Please enter a username!");
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to register user");
            }

            currentUser = data.user;
            alert("Registration successful!");
            document.getElementById("register").style.display = "none";
            document.getElementById("game").style.display = "block";
        } catch (error) {
            console.error("Error registering user:", error);
            alert(error.message);
        }
    });

// Challenge a Friend
document
    .getElementById("challengeFriend")
    .addEventListener("click", async () => {
        if (!currentUser) {
            alert("Please register first!");
            return;
        }

        try {
            const response = await fetch(
                `/api/challenge/${currentUser.username}`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to generate challenge link"
                );
            }

            if (data.shareLink) {
                alert(`Share this link with your friend: ${data.shareLink}`);
            } else {
                alert("Failed to generate challenge link.");
            }
        } catch (error) {
            console.error("Error generating challenge link:", error);
            alert(error.message);
        }
    });

// Initialize the game
fetchDestination();
