import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import jwt from 'jsonwebtoken'

dotenv.config()
const app = express()
const port = process.env.PORT || 8800

app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

// MOCK AUTH ENDPOINTS FOR FRONTEND TESTING
// Replace with actual Sequelize logic once migrations are ready.

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock logic: assign role based on email prefix
  let role = "Officer";
  if (email.startsWith("admin")) role = "Admin";
  if (email.startsWith("farmer")) role = "Farmer";

  // Mock validation
  if (password !== "password") {
    return res.status(401).json({ message: "Invalid credentials. Use 'password' for testing." });
  }

  const user = { id: 1, email, role };
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

  res.json({ token, user });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, role } = req.body;
  
  // Mock registration success
  res.status(201).json({ message: "User registered successfully", user: { id: 2, email, role } });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Mock user response
    res.json({ user: { id: decoded.id, email: "mock@user.com", role: decoded.role } });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.listen(port, () => {
  console.log(`API Server run http://localhost:${port}`)
})
