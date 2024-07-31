const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { Strategy: JwtStrategy } = require('passport-jwt');
const jwt = require('jsonwebtoken');


const app = express();
app.use(bodyParser.json());
app.use(passport.initialize());



// This secret should be stored securely and not hard-coded in a real application
const SECRET_KEY = 'your-secret-key';

// Sample users data (for demonstration purposes)
const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];

const jwtFromRequest = (req) => {
  let token = null;
  if (req && req.headers) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.split(' ')[1]; // Remove 'Bearer ' prefix
    }
  }
  return token;
};

// JWT strategy configuration
const opts = {
  jwtFromRequest,
  secretOrKey: SECRET_KEY,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    // Find the user specified in token
    const user = users.find(user => user.id === jwt_payload.id);
    
    if (user) {
      return done(null, {id: user.id,username: user.username});
    } else {
      return done(null, false);
    }
  })
);

// Login route to authenticate users and issue a JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // User authenticated, generate a JWT
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Protected route example
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log(req.headers);
  res.json({ message: 'You have accessed a protected route', user: req.user, data: req.body });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
