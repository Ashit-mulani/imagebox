import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './router/user-route.js';
import { errorHandler } from './utils/errorHandler.js';
import folderRouter from './router/folder-route.js';
import imageRouter from './router/image-route.js';
import getRouter from './router/get-route.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/api/v1/health', cors(), (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(express.static('public'));

// routes
app.use('/api/v1/user', userRouter);

app.use('/api/v1/folder', folderRouter);

app.use('/api/v1/image', imageRouter);

app.use('/api/v1/get', getRouter);

app.use(errorHandler);

export default app;
