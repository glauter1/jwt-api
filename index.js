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
const authorRouter = require('./author/author.router');
const readerRouter = require('./reader/reader.router');
const bookRouter = require('./book/book.router');
const seedAdmin = require('./config/seed');
const loanRouter = require('./loan/loan.router');
const reportRouter = require('./report/report.router');
require('./models');

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.json());
app.use('/v1/categories', categoryRouter);
app.use('/v1/readers', readerRouter);
app.use('/v1/authors', authorRouter);
app.use('/v1/books', bookRouter);
app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);
app.use('/v1/loans', loanRouter);
app.use('/v1/reports', reportRouter);

db.sync()
    .then(seedAdmin)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Erro ao iniciar a API:', error);
    });