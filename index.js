const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express()
const port = 3000
const db = require('./queries')

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
// Implement authentication middleware to protect routes
function authenticate(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    // Verify the JWT token
    const decodedToken = jwt.verify(token, 'your_secret_key');

    // Attach the user ID to the request for further use
    req.userId = decodedToken.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/protected', authenticate, (req, res) => {
  // Access the authenticated user's ID using req.userId
  res.json({ message: 'This is a protected route' });
});

// middleware function for role-based access control
function authorize(roles) {
  return (req, res, next) => {
    const { role } = req.user;

    if (!roles.includes(role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    next();
  };
}

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)

app.get('/admin', db.getAdmin)
app.post('/admin', db.createAdmin)
app.put('/admin/:id', db.updateAdmin)
app.delete('/admin/:id', db.deleteAdmin)

app.post('/user/login', db.login)

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})