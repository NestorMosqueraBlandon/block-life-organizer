import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import crypto from 'crypto';


console.log(process.env);
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

// Middleware
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
// app.use(rateLimit({ windowMs: 60 * 60 * 3000, max: 900 }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  categories: [{ name: String, color: String }], // custom categories
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});
const User = mongoose.model('User', userSchema);

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  category: String,
  color: String,
  start: String,
  end: String,
  isAllDay: Boolean,
  recurring: { type: Object },
  createdAt: { type: Date, default: Date.now },
});
const Event = mongoose.model('Event', eventSchema);

// Default categories
const DEFAULT_CATEGORIES = [
  { name: 'Work', color: '#4f8cff' },
  { name: 'Class', color: '#ffb347' },
  { name: 'Study', color: '#43d675' },
  { name: 'Personal', color: '#bdbdbd' },
  { name: 'Meeting', color: '#a259ec' },
  { name: 'Break', color: '#f87171' },
  { name: 'Startup', color: '#facc15' },
];

// Helper: Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Routes
// --- Auth ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, name: user.name, email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- User Profile ---
app.get('/api/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ name: user.name, email: user.email, categories: user.categories });
});

// --- Categories ---
app.get('/api/categories', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({
    default: DEFAULT_CATEGORIES,
    custom: user.categories || [],
  });
});

app.post('/api/categories', auth, async (req, res) => {
  const { name, color } = req.body;
  if (!name || !color) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.findById(req.user.id);
  user.categories.push({ name, color });
  await user.save();
  res.json({ success: true });
});

app.delete('/api/categories/:name', auth, async (req, res) => {
  const { name } = req.params;
  const user = await User.findById(req.user.id);
  user.categories = user.categories.filter(cat => cat.name !== name);
  await user.save();
  res.json({ success: true });
});

// --- Events ---
app.get('/api/events', auth, async (req, res) => {
  const events = await Event.find({ userId: req.user.id });
  res.json(events);
});

app.post('/api/events', auth, async (req, res) => {
  const data = req.body;
  data.userId = req.user.id;
  const event = await Event.create(data);
  res.json(event);
});

app.put('/api/events/:id', auth, async (req, res) => {
  const { id } = req.params;
  const event = await Event.findOneAndUpdate({ _id: id, userId: req.user.id }, req.body, { new: true });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

app.delete('/api/events/:id', auth, async (req, res) => {
  const { id } = req.params;
  const event = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json({ success: true });
});

// --- Password Reset ---
app.post('/api/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ success: true }); // Don't reveal if user exists
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();
  const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset for Block Life Organizer.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link will expire in 1 hour.</p>`
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
  res.json({ success: true });
});

app.post('/api/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ success: true });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 