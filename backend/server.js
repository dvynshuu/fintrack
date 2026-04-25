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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/budgeting-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
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
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Goal Schema
const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, required: true },
  targetDate: { type: Date, required: true },
  status: { type: String, required: true },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', goalSchema);

// Expense Schema
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Expense = mongoose.model('Expense', expenseSchema);

// Income Schema
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

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    // console.log('Auth header:', authHeader);

    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for token:', decoded.userId);
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message || 'Authentication failed');
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
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

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
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
    res.status(500).json({ message: 'Error logging in' });
  }
});

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

// Goal Routes
app.get('/api/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

app.post('/api/goals', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      userId: req.user._id
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Error creating goal' });
  }
});

app.put('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Error updating goal' });
  }
});

app.delete('/api/goals/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Error deleting goal' });
  }
});

// Expense Routes
app.get('/api/expenses', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/expenses', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.user._id
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/expenses/summary', auth, async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          amount: 1,
          _id: 0
        }
      }
    ]);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/expenses/monthly', auth, async (req, res) => {
  try {
    const expenseData = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          expenses: { $sum: '$amount' }
        }
      }
    ]);

    const incomeData = await Income.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: { $sum: '$amount' }
        }
      }
    ]);

    // Create a map to merge the data
    const monthlyMap = new Map();

    expenseData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      monthlyMap.set(key, { month: key, expenses: item.expenses, income: 0 });
    });

    incomeData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      if (monthlyMap.has(key)) {
        monthlyMap.get(key).income = item.income;
      } else {
        monthlyMap.set(key, { month: key, expenses: 0, income: item.income });
      }
    });

    // Convert map to array and sort by date
    const combinedData = Array.from(monthlyMap.values()).sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number);
      const [yearB, monthB] = b.month.split('-').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    });

    res.json(combinedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Income Routes
app.get('/api/incomes', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id })
      .sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/incomes', auth, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      userId: req.user._id
    });
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/incomes/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/incomes/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Google OAuth route
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('Received Google auth request:', req.body);
    const { email, name, picture, token } = req.body;

    if (!email || !name || !token) {
      console.error('Missing required fields in request');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find or create user
    console.log('Looking for existing user...');
    let user = await User.findOne({ email });
    if (!user) {
      console.log('Creating new user...');
      user = new User({
        name,
        email,
        password: Math.random().toString(36).slice(-8), // Random password for OAuth users
        profilePicture: picture
      });
      await user.save();
      console.log('New user created:', user.email);
    }

    // Generate JWT token
    console.log('Generating JWT token...');
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Sending successful response...');
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
    console.error('Google auth error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: 'Google authentication failed: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Profile Routes
app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/users/profile', auth, async (req, res) => {
  try {
    console.log('Received profile update request:', req.body);
    const { name, email, phone, location, currency, language, notifications } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already in use:', email);
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {
      name,
      email,
      phone,
      location,
      currency,
      language,
      notifications
    };

    console.log('Updating user with data:', updateData);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully:', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// Settings Routes
app.get('/api/users/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

app.put('/api/users/settings', auth, async (req, res) => {
  try {
    const update = {};
    const settings = req.body;

    // Convert flat settings object to dot notation for Mongoose deep update
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

app.post('/api/insights', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey || apiKey === 'your_openrouter_api_key_here' || !apiKey.startsWith('sk-or-')) {
      return res.json({
        healthScore: 0,
        financialHealth: { savingsRate: 0, emergencyFund: 0, debtToIncome: 0, investmentGrowth: 0 },
        smartSuggestions: [
          {
            "title": "AI Configuration Required",
            "description": "Your OpenRouter API key is missing or invalid. Please check your .env file and restart the server.",
            "type": "alert",
            "impact": "high"
          }
        ]
      });
    }

    // 1. Gather comprehensive data
    const [expenses, incomes, goals] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }).limit(200),
      Income.find({ userId }).sort({ date: -1 }).limit(100),
      Goal.find({ userId })
    ]);

    // Handle case with no data yet
    if (expenses.length === 0 && incomes.length === 0) {
      return res.json({
        healthScore: 0,
        financialHealth: { savingsRate: 0, emergencyFund: 0, debtToIncome: 0, investmentGrowth: 0 },
        smartSuggestions: [
          {
            "title": "Awaiting Financial Data",
            "description": "Add some expenses or income to get personalized AI-driven financial insights and strategies.",
            "type": "milestone",
            "impact": "low"
          }
        ]
      });
    }

    // 2. Aggregate data for AI context
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const filterByMonth = (data, m, y) => data.filter(item => {
      const d = new Date(item.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    // Current Month Stats
    const cmExpenses = filterByMonth(expenses, currentMonth, currentYear);
    const totalExp = cmExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalInc = filterByMonth(incomes, currentMonth, currentYear).reduce((sum, i) => sum + i.amount, 0);
    
    // Category Breakdown
    const categoryBreakdown = cmExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Last 3 Months Trend
    const last3Months = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const mExp = filterByMonth(expenses, m, y).reduce((sum, e) => sum + e.amount, 0);
      const mInc = filterByMonth(incomes, m, y).reduce((sum, i) => sum + i.amount, 0);
      last3Months.push({ month: d.toLocaleString('default', { month: 'short' }), expenses: mExp, income: mInc });
    }

    // 3. High-fidelity prompt for Max Level Thinking
    const prompt = `
      You are FinTrack AI, an elite financial strategist with expertise in personal wealth management and fiscal resilience.
      
      USER DATA SUMMARY:
      - Current Period: ${now.toLocaleString('default', { month: 'long' })} ${currentYear}
      - Monthly Income: ₹${totalInc}
      - Monthly Expenses: ₹${totalExp}
      - Top Categories: ${Object.entries(categoryBreakdown).slice(0, 5).map(([c, a]) => `${c}: ₹${a}`).join(', ')}
      - Historical Trend (Last 3 Months): ${last3Months.map(m => `${m.month}: In ₹${m.income}/Ex ₹${m.expenses}`).join(' | ')}
      - Financial Goals: ${goals.map(g => `${g.title} (${g.type}): ₹${g.currentAmount}/₹${g.targetAmount}`).join(', ') || 'None set'}
      
      TASK:
      Perform a deep-dive analysis of the user's financial health. Calculate a health score (0-100) and specific KPIs based on professional standards (e.g., 50/30/20 rule, 6-month emergency fund rule, etc.).
      
      REQUIRED OUTPUT (STRICT JSON ONLY):
      {
        "healthScore": <number 0-100>,
        "financialHealth": {
          "savingsRate": <percentage of income saved this month>,
          "emergencyFund": <percentage of 6-month buffer goal reached>,
          "debtToIncome": <percentage of income going to debt/loans>,
          "investmentGrowth": <percentage of income invested/asset growth>
        },
        "smartSuggestions": [
          {
            "title": "...",
            "description": "...",
            "type": "saving|alert|growth|milestone",
            "impact": "low|medium|high",
            "action": { "text": "Take Action", "link": "/goals|/expenses|/income" } // optional
          }
        ]
      }

      INSTRUCTIONS:
      1. Be critical but constructive.
      2. If income is 0, the health score should reflect the risk.
      3. The "emergencyFund" should consider goals marked as 'emergency' or 'savings'.
      4. Ensure "smartSuggestions" are highly specific to the data provided.
    `;

    // 4. Smart Model Rotation Strategy
    const models = [
      'google/gemini-2.0-flash-001',
      'liquid/lfm-2.5-1.2b-instruct:free',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-chat'
    ];

    let lastError = null;
    
    for (const model of models) {
      try {
        const response = await axios({
          method: 'post',
          url: 'https://openrouter.ai/api/v1/chat/completions',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'FinTrack AI',
            'Content-Type': 'application/json'
          },
          data: {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3
          },
          timeout: 25000 
        });

        const content = response.data.choices[0].message.content.trim();
        const aiResponse = JSON.parse(content);
        
        // Validate structure
        if (aiResponse.healthScore !== undefined && aiResponse.financialHealth) {
          return res.json(aiResponse);
        }
        
        throw new Error('Invalid AI response structure');

      } catch (apiError) {
        lastError = apiError.response?.data?.error?.message || apiError.message;
        console.warn(`Model ${model} failed: ${lastError}`);
        continue;
      }
    }

    // Fallback if AI fails
    console.error('AI logic failed. Using deterministic fallback.');
    const savingsRate = totalInc > 0 ? Math.max(0, ((totalInc - totalExp) / totalInc) * 100) : 0;
    const score = Math.min(100, Math.round(savingsRate + 10)); // Simple fallback score

    return res.json({
      healthScore: score,
      financialHealth: {
        savingsRate: Math.round(savingsRate),
        emergencyFund: 0,
        debtToIncome: 0,
        investmentGrowth: 0
      },
      smartSuggestions: [
        {
          "title": "Analysis Offline",
          "description": "Our deep-analysis engine is temporarily unavailable. Displaying basic metrics based on your current month data.",
          "type": "alert",
          "impact": "medium"
        }
      ]
    });

  } catch (error) {
    console.error('General AI Insights Error:', error);
    res.status(500).json({ message: 'Internal Server Error during insight generation' });
  }
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 