const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes')
dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes)
app.use('/api/matches', matchRoutes);

app.get('/', (req, res) => {
    res.json({message: "Skill swap API is running"});

});
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`server is running ${PORT}`)); 