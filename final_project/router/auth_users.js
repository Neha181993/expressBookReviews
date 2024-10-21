const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", function (req, res) {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the user exists
    const user = users.find(user => user.username === username);
    if (!user || user.password !== password) { // In a real application, compare hashed passwords
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Create a JWT token
    const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });

    // Send token and success message
    return res.status(200).json({ message: "Login successful!", token });
});

// Add a book review
regd_users.post('auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Get review from query
    const username = req.session.username; // Get username from session

    console.log(username);

    if (!review) {
        return res.status(400).json({ message: "Review text is required." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    // If the user already has a review for this ISBN, modify it
    if (books[isbn].reviews[username]) {
        books[isbn].reviews[username] = review; // Update existing review
        return res.status(200).json({ message: "Review updated successfully!" });
    } else {
        // If it's a new review, add it
        books[isbn].reviews[username] = review; // Add new review
        return res.status(201).json({ message: "Review added successfully!" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
