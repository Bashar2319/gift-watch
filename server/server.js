const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000'
];

if (process.env.CLIENT_URL) {
  const cleanUrl = process.env.CLIENT_URL.trim().replace(/\/$/, '');
  allowedOrigins.push(cleanUrl);
  allowedOrigins.push(`${cleanUrl}/`);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost and any Vercel deployment domain (*.vercel.app)
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isVercel = origin.endsWith('.vercel.app');
    
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost || isVercel || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} blocked by CORS`);
      callback(null, false); // Pass false instead of an Error to avoid breaking the Express middleware flow
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Watch Store API is running...' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
