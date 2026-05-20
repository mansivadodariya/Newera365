import 'dotenv/config';
import express from 'express';
import payload from 'payload';
import { registerCustomEndpoints } from './endpoints';

const app = express();
const port = Number(process.env.PORT ?? 3001);

const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET as string,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload admin: ${payload.getAdminURL()}`);
    },
  });

  // Custom REST endpoints built on the Payload Express app.
  // Pass the initialized payload instance so endpoints can query collections
  // and globals (e.g. reading mt5SyncEnabled from SiteSettings).
  registerCustomEndpoints(app, payload);

  app.listen(port, () => {
    payload.logger.info(`CMS server listening on http://localhost:${port}`);
  });
};

void start();
