import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getInstruments } from './manager';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/instruments', async (req, res) => {
  const assetClass =
    typeof req.query.assetClass === 'string' ? req.query.assetClass : undefined;
  res.json(await getInstruments(assetClass));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MT5 mock service listening on http://localhost:${port}`);
});
