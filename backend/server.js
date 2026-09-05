require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const app = express();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection state tracking
let isMongoConnected = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/budgeting-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 2000
})
  .then(() => {
    isMongoConnected = true;
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    isMongoConnected = false;
    console.warn('MongoDB offline. FinTrack Offline Dev Mode active (auto-seeded).');
  });

mongoose.connection.on('connected', () => { isMongoConnected = true; });
mongoose.connection.on('error', () => { isMongoConnected = false; });
mongoose.connection.on('disconnected', () => { isMongoConnected = false; });

// ── In-Memory Mock Data Store for Offline Dev ──
const MOCK_USER_ID = '66d85fa0c4217b12984e72a1';
let mockUser = {
  _id: MOCK_USER_ID,
  id: MOCK_USER_ID,
  name: 'Demo User',
  email: 'demo@fintrack.com',
  phone: '+91 98765 43210',
  location: 'Mumbai, India',
  currency: 'INR',
  language: 'en',
  notifications: true,
  settings: {
    theme: 'dark',
    currency: 'INR',
    language: 'en',
    notifications: { email: true, push: true },
    display: { dateFormat: 'DD/MM/YYYY', timeFormat: '12h' }
  }
};

let mockExpenses = [
  { _id: 'e1', userId: MOCK_USER_ID, description: 'Apple Developer Account', amount: 8900, category: 'education', date: new Date().toISOString() },
  { _id: 'e2', userId: MOCK_USER_ID, description: 'Whole Foods Groceries', amount: 4250, category: 'food', date: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'e3', userId: MOCK_USER_ID, description: 'Uber Premier Ride', amount: 620, category: 'transportation', date: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: 'e4', userId: MOCK_USER_ID, description: 'NordVPN Annual Plan', amount: 3500, category: 'entertainment', date: new Date(Date.now() - 3 * 86400000).toISOString() },
  { _id: 'e5', userId: MOCK_USER_ID, description: 'Starbucks Reserve Coffee', amount: 480, category: 'food', date: new Date(Date.now() - 4 * 86400000).toISOString() },
  { _id: 'e6', userId: MOCK_USER_ID, description: 'Amazon Electronics', amount: 2190, category: 'shopping', date: new Date(Date.now() - 5 * 86400000).toISOString() },
];

let mockIncomes = [
  { _id: 'i1', userId: MOCK_USER_ID, title: 'Tech Lead Monthly Salary', amount: 145000, category: 'salary', date: new Date().toISOString() },
  { _id: 'i2', userId: MOCK_USER_ID, title: 'Consulting Project Milestone', amount: 32000, category: 'freelance', date: new Date(Date.now() - 7 * 86400000).toISOString() },
  { _id: 'i3', userId: MOCK_USER_ID, title: 'Mutual Fund Dividend', amount: 4800, category: 'investments', date: new Date(Date.now() - 14 * 86400000).toISOString() },
];

let mockGoals = [
  { _id: 'g1', userId: MOCK_USER_ID, title: 'Emergency Reserve Fund', type: 'Emergency Fund', targetAmount: 300000, currentAmount: 210000, targetDate: '2026-12-31', status: 'In Progress', notes: '6 months core expenses' },
  { _id: 'g2', userId: MOCK_USER_ID, title: 'New Electric Vehicle', type: 'Major Purchase', targetAmount: 1200000, currentAmount: 480000, targetDate: '2027-06-30', status: 'In Progress', notes: 'Model 3 / Ioniq 5' },
  { _id: 'g3', userId: MOCK_USER_ID, title: 'Japan Autumn Tour', type: 'Travel', targetAmount: 180000, currentAmount: 140000, targetDate: '2026-10-15', status: 'In Progress', notes: 'Tokyo, Kyoto, Osaka' },
];

const generateMockMonthly = () => [
  { month: '2026-3', income: 125000, expenses: 62000 },
  { month: '2026-4', income: 130000, expenses: 71000 },
  { month: '2026-5', income: 140000, expenses: 65000 },
  { month: '2026-6', income: 135000, expenses: 84000 },
  { month: '2026-7', income: 160000, expenses: 78000 },
  { month: '2026-8', income: 155000, expenses: 73000 },
  { month: '2026-9', income: 181800, expenses: 19940 },
];

const MOCK_AI_INSIGHTS = {
  healthScore: 84,
  financialHealth: {
    savingsRate: 42,
    emergencyFund: 70,
    debtToIncome: 12,
    investmentGrowth: 18
  },
  smartSuggestions: [
    {
      title: "Optimized Savings Rate",
      description: "You're saving 42% of your monthly income, placing your fiscal habits in the top 10% of users.",
      type: "saving",
      impact: "high",
      action: { text: "Review Goals", link: "/goals" }
    },
    {
      title: "Recurring Subscriptions Review",
      description: "Detected 4 active recurring software & entertainment subscriptions. Auditing could save ₹3,500 monthly.",
      type: "alert",
      impact: "medium",
      action: { text: "Manage Expenses", link: "/expenses" }
    },
    {
      title: "Emergency Buffer Milestone",
      description: "Your emergency reserve is at 70% of target. Only ₹90,000 away from a complete 6-month buffer.",
      type: "milestone",
      impact: "high",
      action: { text: "Track Goal", link: "/goals" }
    }
  ]
};

// ── User Schema ──
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
  phone: { type: String },
  location: { type: String },
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'en' },
  notifications: { type: Boolean, default: true },
  settings: {
    theme: { type: String, default: 'light' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    display: {
      dateFormat: { type: String, default: 'MM/DD/YYYY' },
      timeFormat: { type: String, default: '12h' }
    }
  }
});

const User = mongoose.model('User', userSchema);

// ── Expense Schema ──
const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Expense = mongoose.model('Expense', expenseSchema);

// ── Goal Schema ──
const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  status: { type: String, default: 'Not Started' },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', goalSchema);

// ── Income Schema ──
const incomeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Income = mongoose.model('Income', incomeSchema);

// ── Auth Middleware ──
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (!isMongoConnected || decoded.isMock || decoded.userId === MOCK_USER_ID) {
      req.user = mockUser;
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      req.user = mockUser;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message || 'Authentication failed');
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// ── Routes ──

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!isMongoConnected) {
      mockUser = {
        ...mockUser,
        name: name || 'Demo User',
        email: email || 'demo@fintrack.com'
      };
      const token = jwt.sign(
        { userId: MOCK_USER_ID, isMock: true },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      return res.status(201).json({
        token,
        user: {
          id: MOCK_USER_ID,
          name: mockUser.name,
          email: mockUser.email
        }
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Offline mode or Demo credentials
    if (!isMongoConnected || email === 'demo@fintrack.com') {
      const token = jwt.sign(
        { userId: MOCK_USER_ID, isMock: true },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      return res.json({
        token,
        user: {
          id: MOCK_USER_ID,
          name: mockUser.name,
          email: email || mockUser.email
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    // Fallback to demo login if MongoDB query fails
    const token = jwt.sign(
      { userId: MOCK_USER_ID, isMock: true },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: MOCK_USER_ID,
        name: mockUser.name,
        email: req.body?.email || mockUser.email
      }
    });
  }
});

// Current User
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// ── Goal Routes ──
app.get('/api/goals', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(mockGoals);
    }
    const goals = await Goal.find({ userId: req.user._id });
    res.json(goals);
  } catch (error) {
    res.json(mockGoals);
  }
});

app.post('/api/goals', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const newGoal = {
        _id: 'g_' + Date.now(),
        ...req.body,
        userId: MOCK_USER_ID,
        createdAt: new Date().toISOString()
      };
      mockGoals.unshift(newGoal);
      return res.status(201).json(newGoal);
    }
    const goal = new Goal({ ...req.body, userId: req.user._id });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Error creating goal' });
  }
});

app.put('/api/goals/:id', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const idx = mockGoals.findIndex(g => g._id === req.params.id);
      if (idx !== -1) {
        mockGoals[idx] = { ...mockGoals[idx], ...req.body };
        return res.json(mockGoals[idx]);
      }
      return res.status(404).json({ message: 'Goal not found' });
    }
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal' });
  }
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      mockGoals = mockGoals.filter(g => g._id !== req.params.id);
      return res.json({ message: 'Goal deleted successfully' });
    }
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal' });
  }
});

// ── Expense Routes ──
app.get('/api/expenses', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(mockExpenses);
    }
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.json(mockExpenses);
  }
});

app.post('/api/expenses', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const newExpense = {
        _id: 'e_' + Date.now(),
        ...req.body,
        userId: MOCK_USER_ID
      };
      mockExpenses.unshift(newExpense);
      return res.status(201).json(newExpense);
    }
    const expense = new Expense({ ...req.body, userId: req.user._id });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/expenses/:id', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const idx = mockExpenses.findIndex(e => e._id === req.params.id);
      if (idx !== -1) {
        mockExpenses[idx] = { ...mockExpenses[idx], ...req.body };
        return res.json(mockExpenses[idx]);
      }
      return res.status(404).json({ message: 'Expense not found' });
    }
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      mockExpenses = mockExpenses.filter(e => e._id !== req.params.id);
      return res.json({ message: 'Expense deleted successfully' });
    }
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/expenses/summary', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const summary = mockExpenses.reduce((acc, e) => {
        const found = acc.find(item => item.category === e.category);
        if (found) found.amount += e.amount;
        else acc.push({ category: e.category, amount: e.amount });
        return acc;
      }, []);
      return res.json(summary);
    }
    const expenses = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $project: { category: '$_id', amount: 1, _id: 0 } }
    ]);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/expenses/monthly', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(generateMockMonthly());
    }
    const expenseData = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, expenses: { $sum: '$amount' } } }
    ]);

    const incomeData = await Income.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, income: { $sum: '$amount' } } }
    ]);

    const monthlyMap = new Map();
    expenseData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      monthlyMap.set(key, { month: key, expenses: item.expenses, income: 0 });
    });

    incomeData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthlyMap.has(key)) monthlyMap.get(key).income = item.income;
      else monthlyMap.set(key, { month: key, expenses: 0, income: item.income });
    });

    const combinedData = Array.from(monthlyMap.values()).sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number);
      const [yearB, monthB] = b.month.split('-').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });

    res.json(combinedData);
  } catch (error) {
    res.json(generateMockMonthly());
  }
});

// ── Income Routes ──
app.get('/api/incomes', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(mockIncomes);
    }
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.json(mockIncomes);
  }
});

app.post('/api/incomes', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const newIncome = {
        _id: 'i_' + Date.now(),
        ...req.body,
        userId: MOCK_USER_ID,
        createdAt: new Date().toISOString()
      };
      mockIncomes.unshift(newIncome);
      return res.status(201).json(newIncome);
    }
    const income = new Income({ ...req.body, userId: req.user._id });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/incomes/:id', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      const idx = mockIncomes.findIndex(i => i._id === req.params.id);
      if (idx !== -1) {
        mockIncomes[idx] = { ...mockIncomes[idx], ...req.body };
        return res.json(mockIncomes[idx]);
      }
      return res.status(404).json({ message: 'Income not found' });
    }
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/incomes/:id', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      mockIncomes = mockIncomes.filter(i => i._id !== req.params.id);
      return res.json({ message: 'Income deleted successfully' });
    }
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ── Google OAuth ──
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, picture, token } = req.body;

    if (!isMongoConnected) {
      mockUser = { ...mockUser, name: name || mockUser.name, email: email || mockUser.email };
      const jwtToken = jwt.sign(
        { userId: MOCK_USER_ID, isMock: true },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      return res.json({
        token: jwtToken,
        user: {
          id: MOCK_USER_ID,
          name: mockUser.name,
          email: mockUser.email,
          profilePicture: picture
        }
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-8),
        profilePicture: picture
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// ── Profile Routes ──
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(mockUser);
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.json(mockUser);
  }
});

app.put('/api/users/profile', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      mockUser = { ...mockUser, ...req.body };
      return res.json(mockUser);
    }
    const { name, email, phone, location, currency, language, notifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, location, currency, language, notifications },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ── Settings Routes ──
app.get('/api/users/settings', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(mockUser.settings);
    }
    const user = await User.findById(req.user._id).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings);
  } catch (error) {
    res.json(mockUser.settings);
  }
});

app.put('/api/users/settings', auth, async (req, res) => {
  try {
    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      mockUser.settings = { ...mockUser.settings, ...req.body };
      return res.json(mockUser.settings);
    }
    const update = {};
    const settings = req.body;
    Object.keys(settings).forEach(key => {
      if (typeof settings[key] === 'object' && settings[key] !== null) {
        Object.keys(settings[key]).forEach(subKey => {
          update[`settings.${key}.${subKey}`] = settings[key][subKey];
        });
      } else {
        update[`settings.${key}`] = settings[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select('settings');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// ── AI Insights ──
app.post('/api/insights', auth, async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey || apiKey.startsWith('your_') || !apiKey.startsWith('sk-or-')) {
      return res.json(MOCK_AI_INSIGHTS);
    }

    if (!isMongoConnected || req.user._id === MOCK_USER_ID) {
      return res.json(MOCK_AI_INSIGHTS);
    }

    const userId = req.user._id;
    const [expenses, incomes, goals] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }).limit(200),
      Income.find({ userId }).sort({ date: -1 }).limit(100),
      Goal.find({ userId })
    ]);

    if (expenses.length === 0 && incomes.length === 0) {
      return res.json(MOCK_AI_INSIGHTS);
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const cmExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalExp = cmExpenses.reduce((sum, e) => sum + e.amount, 0);
    const cmIncomes = incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalInc = cmIncomes.reduce((sum, i) => sum + i.amount, 0);

    const categoryBreakdown = cmExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const prompt = `
      You are FinTrack AI, an elite financial strategist.
      USER DATA:
      - Monthly Income: ₹${totalInc}
      - Monthly Expenses: ₹${totalExp}
      - Top Categories: ${JSON.stringify(categoryBreakdown)}
      - Financial Goals: ${goals.map(g => `${g.title}: ₹${g.currentAmount}/₹${g.targetAmount}`).join(', ')}
      
      OUTPUT STRICT JSON ONLY:
      {
        "healthScore": <0-100>,
        "financialHealth": { "savingsRate": <num>, "emergencyFund": <num>, "debtToIncome": <num>, "investmentGrowth": <num> },
        "smartSuggestions": [
          { "title": "...", "description": "...", "type": "saving|alert|growth|milestone", "impact": "low|medium|high" }
        ]
      }
    `;

    const response = await axios({
      method: 'post',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      },
      timeout: 15000
    });

    const aiResponse = JSON.parse(response.data.choices[0].message.content.trim());
    if (aiResponse.healthScore !== undefined) {
      return res.json(aiResponse);
    }
    return res.json(MOCK_AI_INSIGHTS);
  } catch (error) {
    console.warn('AI Insights fallback:', error.message);
    res.json(MOCK_AI_INSIGHTS);
  }
});

// ── Server Listen ──
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`FinTrack API Server running on port ${PORT}`);
});