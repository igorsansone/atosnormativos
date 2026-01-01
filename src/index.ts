import express from 'express';
import bodyParser from 'body-parser';
import actsRouter from './routes/acts';

const app = express();
app.use(bodyParser.json());

app.use('/api/acts', actsRouter);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
