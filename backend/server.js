const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ MongoDB error:', err);
  process.exit(1);
});

// ============ SCHEMAS ============

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  notified: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// ============ EMAIL SETUP ============

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD.replace(/\s/g, '') // Remove spaces
  }
});

// ============ AUTHENTICATION ============

// Register/Login with email only
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({ email: email.toLowerCase() });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ PRODUCTS ============

// Get all products for user
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await Product.find({ userId: req.userId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add product
app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, expiryDate, email } = req.body;

    if (!name || !expiryDate || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = new Product({
      userId: req.userId,
      name,
      expiryDate: new Date(expiryDate),
      email
    });

    await product.save();

    // Send welcome email
    const user = await User.findById(req.userId);
    await sendEmail(
      email,
      `Product Added: ${name}`,
      `Product "${name}" will expire on ${new Date(expiryDate).toLocaleDateString()}. You will receive notifications when it expires.`
    );

    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ NOTIFICATIONS ============

// Check and send expiry notifications (call this periodically)
app.post('/api/check-expiry', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const products = await Product.find({ notified: false });

    for (const product of products) {
      const expiryDate = new Date(product.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      // Send notification only when expired or expiring today
      if (daysLeft <= 0) {
        let subject = '';
        let message = '';

        if (daysLeft < 0) {
          subject = `⚠️ EXPIRED: ${product.name}`;
          message = `The product "${product.name}" has EXPIRED ${Math.abs(daysLeft)} days ago on ${expiryDate.toLocaleDateString()}.\n\nPlease dispose of it immediately!`;
        } else if (daysLeft === 0) {
          subject = `⚠️ EXPIRES TODAY: ${product.name}`;
          message = `The product "${product.name}" EXPIRES TODAY (${expiryDate.toLocaleDateString()})!\n\nPlease check and use it as soon as possible!`;
        }

        await sendEmail(product.email, subject, message);

        // Mark as notified
        product.notified = true;
        await product.save();
      }
    }

    res.json({ success: true, message: 'Checked and sent notifications' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ EMAIL FUNCTION ============

async function sendEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 20px; border-radius: 8px;">
            <h2>${subject}</h2>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">Product Expiry Tracker</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email error:', err);
  }
}

// ============ MIDDLEWARE ============

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.userId = decoded.userId;
    next();
  });
}

// ============ CRON JOB (Check expiry every hour) ============

setInterval(async () => {
  console.log('⏰ Checking for expired products...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const products = await Product.find({ notified: false });

    for (const product of products) {
      const expiryDate = new Date(product.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        let subject = '';
        let message = '';

        if (daysLeft < 0) {
          subject = `⚠️ EXPIRED: ${product.name}`;
          message = `The product "${product.name}" has EXPIRED ${Math.abs(daysLeft)} days ago on ${expiryDate.toLocaleDateString()}.\n\nPlease dispose of it immediately!`;
        } else if (daysLeft === 0) {
          subject = `⚠️ EXPIRES TODAY: ${product.name}`;
          message = `The product "${product.name}" EXPIRES TODAY (${expiryDate.toLocaleDateString()})!\n\nPlease check and use it as soon as possible!`;
        }

        await sendEmail(product.email, subject, message);
        product.notified = true;
        await product.save();
        console.log(`📧 Notification sent for ${product.name}`);
      }
    }
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
}, 60 * 60 * 1000); // Every hour

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
