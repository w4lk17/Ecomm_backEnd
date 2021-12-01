import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

const app = express();

const PORT = process.env.PORT || 5000;

import productsRoute from './routes/products.js';
import usersRoute from './routes/users.js';
import ordersRoute from './routes/orders.js';
import authRoute from './routes/auth.js';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: 'Content-Type, Authaurization, Origin, X-Requested-With, Accept'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('hello , THE ECOMM API IS RUNNING');
});

//uses routes
app.use('/api/products', productsRoute);
app.use('/api/users', usersRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/auth', authRoute);

app.listen(PORT, () => console.log(`server running on port: ${PORT}`));