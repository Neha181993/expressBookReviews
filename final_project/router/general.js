const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios')

// User registration endpoint
public_users.post('/register', function (req, res) {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    console.log(users);
    
    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists." });
    }

    // Register the new user
    const newUser = { username, password }; // In a real application, you should hash the password
    users.push(newUser);

    return res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Retrieve the list of books from the local data
    const bookList = Object.values(books); // Convert the books object to an array

    // Check if books are available
    if (bookList.length > 0) {
        return res.status(200).json({ books: bookList });
    } else {
        return res.status(404).json({ message: "No books available in the shop." });
    }
});


public_users.get('/books', async function (req, res) {
    try {
        // Fetch the list of books from the local server
        const response = await axios.get('http://localhost:5024/');
        return res.status(200).json({ books: response.data });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Extract ISBN from the request parameters
    const book = books[isbn]; // Find the book using the isbn as the key

    if (book) {
        return res.status(200).json({ book });
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});


 // Get book details based on ISBN
 public_users.get('/books/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn; // Extract the ISBN from the request parameters

    try {
        // Simulate an API call to get book details based on ISBN
        // For demonstration purposes, we'll use a local endpoint
        const response = await axios.get(`http://localhost:5026/isbn/${isbn}`);
        
        if (response.data) {
            // If the book is found, return its details
            return res.status(200).json({ book: response.data });
        } else {
            // If no book found with the given ISBN, send a 404 response
            return res.status(404).json({ message: "Book not found." });
        }
    } catch (error) {
        // Handle any errors that might occur
        return res.status(500).json({ message: "Error retrieving book details", error: error.message });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author.toLowerCase(); // Get the author from the URL and convert to lowercase for case-insensitive matching
    const matchedBooks = Object.values(books).filter(book => 
        book.author.toLowerCase() === authorName // Filter books where the author matches
    );

    if (matchedBooks.length > 0) {
        return res.status(200).json({ books: matchedBooks });
    } else {
        return res.status(404).json({ message: "No books found for the given author." });
    }
});


// Get book details based on author using Axios
public_users.get('/books1/author/:author', async function (req, res) {
    const authorName = req.params.author; // Get the author from the URL

    try {
        // Assuming you have an API endpoint to get books by author, replace 'http://your_api_url' with your actual API endpoint
        const response = await axios.get(`http://localhost:5030/author/${authorName}`);
        const matchedBooks = response.data; // Assuming the API returns the matched books directly

        if (matchedBooks.length > 0) {
            return res.status(200).json({ books: matchedBooks });
        } else {
            return res.status(404).json({ message: "No books found for the given author." });
        }
    } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching the books." });
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase(); // Convert the title from URL to lowercase for case-insensitive matching
    let foundBooks = []; // Initialize an array to store matching books

    // Iterate through the books dictionary to find matching titles
    for (const key in books) {
        if (books.hasOwnProperty(key)) {
            const book = books[key];
            if (book.title.toLowerCase().includes(title)) {
                foundBooks.push(book); // Add matching book to the array
            }
        }
    }

    if (foundBooks.length > 0) {
        return res.status(200).json({ books: foundBooks }); // Send filtered books as JSON response
    } else {
        return res.status(404).json({ message: "No books found with the given title" }); // Send 404 if no books are found
    }
});


// Get all books based on title using Axios
public_users.get('/books/title/:title', async function (req, res) {
    const title = req.params.title; // Get the title from the URL and convert to lowercase
    let foundBooks = []; // Initialize an array to store matching books

    try {
        // Assuming you have an API endpoint to get books by title
        const response = await axios.get(`http://localhost:5029/title/${title}`); // Update this URL according to your API structure
        
        if (response.data && response.data.length > 0) {
            foundBooks = response.data; // Store found books
            return res.status(200).json({ books: foundBooks }); // Send matching books as JSON response
        } else {
            return res.status(404).json({ message: "No books found with the given title" }); // Send 404 if no books are found
        }
    } catch (error) {
        // Handle any errors that occur during the request
        console.error(error);
        return res.status(500).json({ message: "An error occurred while fetching the books." });
    }
});


// Get reviews for a specific book based on its ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Get the ISBN from URL

    // Find the book with the specified ISBN
    const book = books[isbn]; // Access the book by its ISBN key

    if (book) {
        // If the book is found, check if it has reviews
        if (Object.keys(book.reviews).length > 0) {
            return res.status(200).json({ reviews: book.reviews }); // Send reviews as JSON response
        } else {
            return res.status(404).json({ message: "No reviews found for this book" }); // Send 404 if no reviews exist
        }
    } else {
        return res.status(404).json({ message: "Book not found" }); // Send 404 if the book with that ISBN does not exist
    }
});


module.exports.general = public_users;




