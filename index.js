const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchRoutes = require('./routes/matchRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reviewRoutes = require('./routes/reviewRoutes');


dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});


app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes)
app.use('/api/matches', matchRoutes);
app.use('/api/chat', chatRoutes);
require('./socket/socketHandler')(io); 
app.use('/api/reviews', reviewRoutes);
app.get('/', (req, res) => {
    res.json({message: "Skill swap API is running"});

});
const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=> console.log(`server is running ${PORT}`)); 