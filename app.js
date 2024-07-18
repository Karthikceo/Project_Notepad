const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON requests

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define user schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    name: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Serve login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/login.html'));
});

// Handle login POST request
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const foundUser = await User.findOne({ username, password });
        if (foundUser) {
            // Redirect to final.html upon successful login
            res.sendFile(path.join(__dirname, '/views/final.html'));
        } else {
            res.send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error in login:', err);
        res.send('Error occurred');
    }
});

// Handle registration POST request
app.post('/register', async (req, res) => {
    const { username, password, email, name } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.send('Username or email already exists');
        }

        const newUser = new User({ username, password, email, name });
        await newUser.save();
        res.send('Registration successful');
    } catch (err) {
        console.error('Error in registration:', err);
        res.send('Error occurred');
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
