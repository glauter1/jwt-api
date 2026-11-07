const dotenv = require('dotenv');
dotenv.config();
const db = require('./config/db');
const express = require('express');
const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');
const categoryRouter = require('./category/category.router');
require('./models');

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());
app.use('/v1/categories', categoryRouter);


app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);

db.sync()
app.listen(PORT, () => {
    console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
});