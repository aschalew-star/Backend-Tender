const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const userRouter = require('./routes/userRoutes.js');
const tender = require('./routes/tenderRoute.js');
const subcatagory = require('./routes/sucatagoryroute.js');
const region = require('./routes/Region.js');
const Bank = require('./routes/Bank.js');
const payment = require('./routes/payment.js');
const notification=require('./routes/Notification.js')
const { runSubscriptionCheck } = require("./utili/Scheduler.js")
const catagory = require('./routes/Catagory.js')
const advertisement = require('./routes/Advertisment.js')
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json({ extended: true, limit: '50mb' }));
app.use(cors(
  {
    origin: ['http://localhost:3000', 'https://your-production-url.com',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
  }
));
app.use(cookieParser());

runSubscriptionCheck()

//get static files like documents
// Serve /Uploads folder as /uploads in browser
// app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(express.static(path.join(__dirname, 'Uploads')));
app.use('/uploads/advertisements', express.static(path.join(__dirname, 'Uploads/Advertisements')));

app.get('/test', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

app.use('/api/users', userRouter);
app.use('/api/tender', tender);
app.use('/api/subcatagory', subcatagory);
app.use('/api/advertisement',advertisement);
app.use('/api/catagory', catagory);
app.use('/api/region', region);
app.use('/api/Bank', Bank);
app.use('/api/notification', notification);
app.use('/api/payment', payment);

// Global error handler
app.use((err, req, res, next) => {
  const message = err.message || 'Internal server error';
  const status = err.statusCode || 500;
  res.status(status).json({
    message,
    status,
  });
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, (err) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log(`Server listening on http://localhost:${port}`);
  }
});
