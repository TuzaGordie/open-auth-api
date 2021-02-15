const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');


dotenv.config();


//Import Routes
const authRoute = require('./api/routes/auth');
const profileRoute = require('./api/routes/profile');


//Connect to DB
mongoose.connect(process.env.DB_CONNECT, { 
        useNewUrlParser: true, useUnifiedTopology: true }, () => 
        console.log('db connected')
);

app.use(express.urlencoded({ extended: false }));

// middleware
app.use(express.json());
app.use(cors());

//Routes middlewares
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);

app.listen(process.env.PORT || 3000);